import {
  test,
  expect,
  APIRequestContext
} from '@playwright/test';

// ======================================================
// CONSTANTS
// Use environment variables in CI; fall back to dev
// defaults locally so no secrets are hardcoded.
// ======================================================

const API_URL =
  process.env.API_URL ??
  'https://dev.propfocus.in/api/whatsapp-webhook';

// Phone numbers are stored as strings to preserve
// leading zeros and avoid accidental arithmetic.
const PHONE = {
  ACTIVE:    process.env.TEST_PHONE             ?? '8888888888',
  INACTIVE:  process.env.INACTIVE_BROKER_PHONE  ?? '7777777777',
  SUSPENDED: process.env.SUSPENDED_ORG_PHONE    ?? '6666666666',
} as const;

// ======================================================
// TYPES
// ======================================================

// Matches the actual API response shape exactly.
// buyerName / buyerId / projectName / rnr are NOT
// top-level fields — validated via the message string.
interface MicrositeResponseBody {
  success:      boolean;
  imageURL:     string | null;
  micrositeUrl: string | null;
  message:      string;
}

interface ExpectedFields {
  buyerName?:   string;
  buyerId?:     string;
  projectName?: string;
}

interface PositiveCase {
  name:            string;
  body:            string;
  validateRNR?:    boolean;
  expectedFields?: ExpectedFields;
}

interface NegativeCase {
  name: string;
  body: string;
}

// ======================================================
// HELPER
// ======================================================

async function sendMicrositeRequest(
  request:     APIRequestContext,
  messageBody: string,
  phone:       string = PHONE.ACTIVE
): Promise<{ response: Awaited<ReturnType<APIRequestContext['post']>>; responseBody: MicrositeResponseBody }> {

  const response = await request.post(API_URL, {
    data: {
      event: 'message',
      data: {
        from: phone,
        body: messageBody
      }
    }
  });

  expect(response.status()).toBe(200);

  const responseBody: MicrositeResponseBody =
    await response.json();

  console.log(`\nPhone      : ${phone}`);
  console.log(`Request    : ${messageBody}`);
  console.log(JSON.stringify(responseBody, null, 2));

  return { response, responseBody };
}

// ======================================================
// SHARED ASSERTIONS
// Centralised so every callsite stays DRY.
// ======================================================

function assertSuccess(body: MicrositeResponseBody) {
  expect(body.success).toBe(true);
  expect(body.micrositeUrl).toBeTruthy();
}

function assertFailure(body: MicrositeResponseBody) {
  expect(body.success).not.toBe(true);
  expect(body.micrositeUrl).toBeFalsy();
}

function assertRNR(body: MicrositeResponseBody) {
  // RNR is not a top-level field — the API signals it
  // via the message string (e.g. "RNR status recorded").
  expect(body.message.toLowerCase()).toContain('rnr');
}

function assertExpectedFields(
  body:   MicrositeResponseBody,
  fields: ExpectedFields | undefined
) {
  if (!fields) return;

  const msg = body.message.toLowerCase();

  // Each expected value must appear somewhere in the
  // message string. This avoids undefined.toLowerCase()
  // crashes caused by fields that don't exist on the body.
  for (const value of Object.values(fields)) {
    if (value) {
      expect(msg).toContain(value.toLowerCase());
    }
  }
}

// ======================================================
// POSITIVE TEST CASES
// ======================================================

const positiveCases: PositiveCase[] = [

  {
    name: 'Valid Input',
    body: 'Harsha with ID 9121 for Abhee Tranquila',
    expectedFields: {
      buyerName:   'Harsha',
      buyerId:     '9121',
      projectName: 'Abhee Tranquila'
    }
  },

  {
    name: 'ALL CAPS Input',
    body: 'HARSHA WITH ID 9121 FOR ABHEE TRANQUILA',
    expectedFields: {
      buyerName:   'Harsha',
      buyerId:     '9121',
      projectName: 'Abhee Tranquila'
    }
  },

  {
    name: 'Mixed Case Input',
    body: 'HaRsHa WiTh Id 9121 FoR AbHeE TrAnQuIlA',
    expectedFields: {
      buyerName:   'Harsha',
      projectName: 'Abhee Tranquila'
    }
  },

  {
    name:        'RNR Status',
    body:        'Harsha with ID 9121 for Abhee Tranquila RNR',
    validateRNR: true,
    expectedFields: {
      buyerName:   'Harsha',
      buyerId:     '9121',
      projectName: 'Abhee Tranquila'
    }
  },

  {
    name: 'RNR mixed case',
    body: 'Harsha with ID 9121 for Abhee Tranquila rNr',
    validateRNR: true,
    expectedFields: {
      buyerName:   'Harsha',
      buyerId:     '9121',
      projectName: 'Abhee Tranquila'
    }
  },

  {
    name: 'Mr Prefix',
    body: 'Mr Harsha with ID 9121 for Abhee Tranquila',
    expectedFields: {
      buyerName:   'Harsha',
      buyerId:     '9121',
      projectName: 'Abhee Tranquila'
    }
  },

  {
    name: 'Dr Prefix',
    body: 'Dr Harsha with ID 9121 for Abhee Tranquila',
    expectedFields: {
      buyerName:   'Harsha',
      buyerId:     '9121',
      projectName: 'Abhee Tranquila'
    }
  },

  {
    name: 'Shri Prefix',
    body: 'Shri Harsha with ID 9121 for Abhee Tranquila',
    expectedFields: {
      buyerName:   'Harsha',
      buyerId:     '9121',
      projectName: 'Abhee Tranquila'
    }
  },

  {
    name: 'Minor Wrong Spelling',
    body: 'Harsha with ID 9121 for Abhee Tranqula',
    expectedFields: {
      buyerName:   'Harsha',
      buyerId:     '9121',
      projectName: 'Abhee Tranquila'  // API should resolve fuzzy match to canonical name
    }
  },

  {
    name: 'Partial Project Name',
    body: 'Harsha with ID 9121 for Tranquila',
    expectedFields: { projectName: 'Tranquila' }
  },

  {
    name: 'KNS Short Form',
    body: 'Harsha with ID 9121 for KNS',
    expectedFields: { projectName: 'KNS' }
  },

  {
    name: 'Multiple Projects',
    body: 'Harsha with ID 9121 for Abhee Tranquila and KNS Sampada',
    expectedFields: {
      buyerName: 'Harsha',
      buyerId:   '9121'
      // projectName not validated here — multiple projects returned as array;
      // add a dedicated multi-project assertion if the API shape supports it
    }
  },

  {
    name: 'Multiple Farm Projects',
    body: 'Harsha with ID 9121 for Samruddhi Farms, Sampada, Samooha',
    expectedFields: {
      buyerName: 'Harsha',
      buyerId:   '9121'
    }
  },

  {
    name: 'Dash Separator',
    body: 'Harsha with ID 9121 - Abhee Tranquila',
    expectedFields: {
      buyerName:   'Harsha',
      buyerId:     '9121',
      projectName: 'Abhee Tranquila'
    }
  },

  {
    name: 'Mixed Delimiters',
    body: 'Harsha - Abhee / Tranquila',
    expectedFields: {
      buyerName:   'Harsha',
      projectName: 'Abhee Tranquila'
    }
  },

  {
    name: 'Emoji Input',
    body: '🏠 Harsha with ID 9121 for Abhee Tranquila',
    expectedFields: {
      buyerName:   'Harsha',
      buyerId:     '9121',
      projectName: 'Abhee Tranquila'
    }
  },

  {
    name: 'Apostrophe Name',
    body: "O'Brien with ID 9121 for Abhee Tranquila",
    expectedFields: {
      buyerName:   "O'Brien",
      buyerId:     '9121',
      projectName: 'Abhee Tranquila'
    }
  },

  {
    name: 'Accented Characters',
    body: 'José with ID 9121 for Abhee Tranquila',
    expectedFields: {
      buyerName:   'José',
      buyerId:     '9121',
      projectName: 'Abhee Tranquila'
    }
  },

  {
    name: 'Multiple Spaces',
    body: 'Aakash          Bhatnagar with ID A344 for Abhee Aria',
    expectedFields: {
      buyerName:   'Aakash Bhatnagar',
      buyerId:     'A344',
      projectName: 'Abhee Aria'
    }
  },

  {
    name: 'Multi-line Input',
    body:
`Rahul Sharma
Abhee Tranquila
KNS Sampada`,
    expectedFields: {
      buyerName:   'Rahul Sharma',
      projectName: 'Abhee Tranquila'
    }
  }

];

// ======================================================
// NEGATIVE TEST CASES
// ======================================================

const negativeCases: NegativeCase[] = [

  {
    name: 'Invalid Project Name',
    body: 'Harsha with ID 9121 for XYZ Project'
  },

  {
    name: 'Missing Buyer Name',
    body: 'with ID 9121 for Abhee Tranquila'
  },

  {
    name: 'Numeric Buyer Name',
    body: '12345 for Abhee Tranquila'
  },

  {
    name: 'Special Characters Only',
    body: '@@@ ### $$$'
  },

  {
    name: 'Incomplete Buyer ID',
    body: 'Harsha with ID for Abhee Tranquila'
  },

  {
    name: 'Invalid Buyer ID',
    body: 'Harsha with ID @@@ for Abhee Tranquila'
  }

];

// ======================================================
// POSITIVE TEST EXECUTION
// ======================================================

for (const testData of positiveCases) {

  test(
    `Microsite Positive - ${testData.name} @sanity`,
    async ({ request }) => {

      const { responseBody } =
        await sendMicrositeRequest(request, testData.body);

      // 1. Success shape
      assertSuccess(responseBody);

      // 2. RNR flag (only when case declares it)
      if (testData.validateRNR) {
        assertRNR(responseBody);
      }

      // 3. Field-level validation
      assertExpectedFields(responseBody, testData.expectedFields);

    }
  );

}

// ======================================================
// NEGATIVE TEST EXECUTION
// ======================================================

for (const testData of negativeCases) {

  test(
    `Microsite Negative - ${testData.name} @regression`,
    async ({ request }) => {

      const { responseBody } =
        await sendMicrositeRequest(request, testData.body);

      assertFailure(responseBody);

    }
  );

}

// ======================================================
// MICROSITE REUSE FLOW
// Same input must return the identical URL both times.
// Both calls must individually succeed before comparing
// URLs — otherwise two undefined values would falsely
// match and hide a real failure.
// ======================================================

test(
  'Microsite Reuse Flow @regression',
  async ({ request }) => {

    const BODY = 'Harsha with ID 9121 for Abhee Tranquila';

    const first  = await sendMicrositeRequest(request, BODY);
    const second = await sendMicrositeRequest(request, BODY);

    // Guard: both calls must succeed independently
    assertSuccess(first.responseBody);
    assertSuccess(second.responseBody);

    // Idempotency: same input → same URL
    expect(first.responseBody.micrositeUrl)
      .toBe(second.responseBody.micrositeUrl);

  }
);

// ======================================================
// PERFORMANCE TEST
// ======================================================

test(
  'Microsite API Performance @performance',
  async ({ request }) => {

    const start = Date.now();

    const { responseBody } = await sendMicrositeRequest(
      request,
      'Harsha with ID 9121 for Abhee Tranquila'
    );

    const ms = Date.now() - start;
    console.log(`Response time: ${ms} ms`);

    assertSuccess(responseBody);
    expect(ms).toBeLessThan(5000);

  }
);

// ======================================================
// SUSPENDED ORGANIZATION
// ======================================================

test(
  'Suspended Organization Validation @regression',
  async ({ request }) => {

    const { responseBody } = await sendMicrositeRequest(
      request,
      'Harsha with ID 9121 for Abhee Tranquila',
      PHONE.SUSPENDED
    );

    assertFailure(responseBody);

  }
);

// ======================================================
// INACTIVE BROKER
// ======================================================

test(
  'Inactive Broker Validation @regression',
  async ({ request }) => {

    const { responseBody } = await sendMicrositeRequest(
      request,
      'Harsha with ID 9121 for Abhee Tranquila',
      PHONE.INACTIVE
    );

    assertFailure(responseBody);

  }
);