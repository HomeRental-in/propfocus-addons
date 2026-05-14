import {
  test,
  expect,
  APIRequestContext
} from '@playwright/test';

// ======================================================
// CONSTANTS
// ======================================================

const API_URL =
  process.env.API_URL ??
  'https://dev.propfocus.in/api/whatsapp-webhook';

const PHONE = {
  ACTIVE:
    process.env.TEST_PHONE ??
    '8888888888',

  INACTIVE:
    process.env.INACTIVE_BROKER_PHONE ??
    '7777777777',

  SUSPENDED:
    process.env.SUSPENDED_ORG_PHONE ??
    '6666666666',
} as const;

// ======================================================
// TYPES
// ======================================================

interface MicrositeResponseBody {
  success: boolean;
  imageURL: string | null;
  micrositeUrl: string | null;
  message: string;
  buyerid?: string;
}

interface ExpectedFields {
  buyerName?: string;
  projectName?: string;
}

interface PositiveCase {
  name: string;
  body: string;
  validateRNR?: boolean;
  expectedFields?: ExpectedFields;
}

interface NegativeCase {
  name: string;
  body: string;
}

// ======================================================
// UNIQUE BUYER ID
// ======================================================

function uniqueBuyerId() {

  const timestamp =
    Date.now().toString().slice(-4);

  const random =
    Math.floor(100 + Math.random() * 900);

  return `AUTO${timestamp}${random}`;
}

// ======================================================
// HELPER
// ======================================================

async function sendMicrositeRequest(
  request: APIRequestContext,
  messageBody: string,
  phone: string = PHONE.ACTIVE
): Promise<{
  response: Awaited<
    ReturnType<APIRequestContext['post']>
  >;
  responseBody: MicrositeResponseBody;
}> {

  const response = await request.post(
    API_URL,
    {
      data: {
        event: 'message',
        data: {
          from: phone,
          body: messageBody
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody:
    MicrositeResponseBody =
      await response.json();

  console.log(
    `\nPhone      : ${phone}`
  );

  console.log(
    `Request    : ${messageBody}`
  );

  console.log(
    JSON.stringify(
      responseBody,
      null,
      2
    )
  );

  return {
    response,
    responseBody
  };
}

// ======================================================
// ASSERTIONS
// ======================================================

function assertSuccess(
  body: MicrositeResponseBody
) {

  expect(body.success)
    .toBe(true);

  expect(body.micrositeUrl)
    .toBeTruthy();

}

function assertFailure(
  body: MicrositeResponseBody
) {

  expect(body.success)
    .not.toBe(true);

  expect(body.micrositeUrl)
    .toBeFalsy();

}

function assertRNR(
  body: MicrositeResponseBody
) {

  expect(
    body.message.toLowerCase()
  ).toContain(
    'tried reaching you'
  );

}

function assertExpectedFields(
  body: MicrositeResponseBody,
  fields?: ExpectedFields
) {

  if (!fields) return;

  const message =
    body.message.toLowerCase();

  for (
    const value of
    Object.values(fields)
  ) {

    if (value) {

      expect(message)
        .toContain(
          value.toLowerCase()
        );

    }

  }

}

// ======================================================
// POSITIVE TEST CASES
// ======================================================

const positiveCases:
  PositiveCase[] = [

  {
    name: 'Valid Input',
    body:
      `Harsha with ID ${uniqueBuyerId()} for Abhee Tranquila`,
    expectedFields: {
      buyerName: 'Harsha',
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'ALL CAPS Input',
    body:
      `HARSHA WITH ID ${uniqueBuyerId()} FOR ABHEE TRANQUILA`,
    expectedFields: {
      buyerName: 'Harsha',
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'Mixed Case Input',
    body:
      `HaRsHa WiTh Id ${uniqueBuyerId()} FoR AbHeE TrAnQuIlA`,
    expectedFields: {
      buyerName: 'Harsha',
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'RNR Status',
    body:
      `Harsha with ID ${uniqueBuyerId()} for Abhee Tranquila RNR`,
    validateRNR: true,
    expectedFields: {
      buyerName: 'Harsha',
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'RNR mixed case',
    body:
      `Harsha with ID ${uniqueBuyerId()} for Abhee Tranquila rNr`,
    validateRNR: true,
    expectedFields: {
      buyerName: 'Harsha',
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'Mr Prefix',
    body:
      `Mr Harsha with ID ${uniqueBuyerId()} for Abhee Tranquila`,
    expectedFields: {
      buyerName: 'Harsha',
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'Dr Prefix',
    body:
      `Dr Harsha with ID ${uniqueBuyerId()} for Abhee Tranquila`,
    expectedFields: {
      buyerName: 'Harsha',
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'Shri Prefix',
    body:
      `Shri Harsha with ID ${uniqueBuyerId()} for Abhee Tranquila`,
    expectedFields: {
      buyerName: 'Harsha',
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'Minor Wrong Spelling',
    body:
      `Harsha with ID ${uniqueBuyerId()} for Abhee Tranqula`,
    expectedFields: {
      buyerName: 'Harsha',
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'Partial Project Name',
    body:
      `Harsha with ID ${uniqueBuyerId()} for Tranquila`,
    expectedFields: {
      projectName:
        'Tranquila'
    }
  },

  {
    name: 'KNS Short Form',
    body:
      `Harsha with ID ${uniqueBuyerId()} for KNS`,
    expectedFields: {
      buyerName: 'Harsha'
    }
  },

  {
    name: 'Multiple Projects',
    body:
      `Harsha with ID ${uniqueBuyerId()} for Abhee Tranquila and KNS Sampada`,
    expectedFields: {
      buyerName: 'Harsha'
    }
  },

  {
    name: 'Multiple Farm Projects',
    body:
      `Harsha with ID ${uniqueBuyerId()} for Samruddhi Farms, Sampada, Samooha`,
    expectedFields: {
      buyerName: 'Harsha'
    }
  },

  {
    name: 'Dash Separator',
    body:
      `Harsha with ID ${uniqueBuyerId()} - Abhee Tranquila`,
    expectedFields: {
      buyerName: 'Harsha',
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'Mixed Delimiters',
    body:
      'Harsha - Abhee / Tranquila',
    expectedFields: {
      buyerName: 'Harsha',
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'Emoji Input',
    body:
      `🏠 Harsha with ID ${uniqueBuyerId()} for Abhee Tranquila`,
    expectedFields: {
      buyerName: 'Harsha',
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'Apostrophe Name',
    body:
      `O'Brien with ID ${uniqueBuyerId()} for Abhee Tranquila`,
    expectedFields: {
      buyerName: "O'Brien",
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'Accented Characters',
    body:
      `José with ID ${uniqueBuyerId()} for Abhee Tranquila`,
    expectedFields: {
      buyerName: 'José',
      projectName:
        'Abhee Tranquila'
    }
  },

  {
    name: 'Multiple Spaces',
    body:
      `Aakash          Bhatnagar with ID ${uniqueBuyerId()} for Abhee Aria`,
    expectedFields: {
      buyerName:
        'Aakash Bhatnagar',
      projectName:
        'Abhee Aria'
    }
  },

  {
    name: 'Multi-line Input',
    body:
`Rahul Sharma
Abhee Tranquila
KNS Sampada`,
    expectedFields: {
      buyerName:
        'Rahul Sharma',
      projectName:
        'Abhee Tranquila'
    }
  }

];

// ======================================================
// NEGATIVE TEST CASES
// ======================================================

const negativeCases:
  NegativeCase[] = [

  {
    name:
      'Invalid Project Name',
    body:
      `Harsha with ID ${uniqueBuyerId()} for XYZ Project`
  },

  {
    name:
      'Missing Buyer Name',
    body:
      `with ID ${uniqueBuyerId()} for Abhee Tranquila`
  },

  {
    name:
      'Numeric Buyer Name',
    body:
      '12345 for Abhee Tranquila'
  },

  {
    name:
      'Special Characters Only',
    body:
      '@@@ ### $$$'
  },

  {
    name:
      'Incomplete Buyer ID',
    body:
      'Harsha with ID for Abhee Tranquila'
  },

  {
    name:
      'Invalid Buyer ID',
    body:
      'Harsha with ID @@@ for Abhee Tranquila'
  }

];

// ======================================================
// POSITIVE TEST EXECUTION
// ======================================================

for (
  const testData
  of positiveCases
) {

  test(
    `Microsite Positive - ${testData.name} @sanity`,

    async ({ request }) => {

      const {
        responseBody
      } =
        await sendMicrositeRequest(
          request,
          testData.body
        );

      assertSuccess(
        responseBody
      );

      if (
        testData.validateRNR
      ) {

        assertRNR(
          responseBody
        );

      }

      assertExpectedFields(
        responseBody,
        testData.expectedFields
      );

    }
  );

}

// ======================================================
// NEGATIVE TEST EXECUTION
// ======================================================

for (
  const testData
  of negativeCases
) {

  test(
    `Microsite Negative - ${testData.name} @regression`,

    async ({ request }) => {

      const {
        responseBody
      } =
        await sendMicrositeRequest(
          request,
          testData.body
        );

      assertFailure(
        responseBody
      );

    }
  );

}

// ======================================================
// MICROSITE REUSE FLOW
// ======================================================

test(
  'Microsite Reuse Flow @regression',

  async ({ request }) => {

    const buyerId =
      uniqueBuyerId();

    const BODY =
      `Harsha with ID ${buyerId} for Abhee Tranquila`;

    const first =
      await sendMicrositeRequest(
        request,
        BODY
      );

    const second =
      await sendMicrositeRequest(
        request,
        BODY
      );

    assertSuccess(
      first.responseBody
    );

    assertSuccess(
      second.responseBody
    );

    expect(
      first.responseBody
        .micrositeUrl
    ).toBe(
      second.responseBody
        .micrositeUrl
    );

  }
);

// ======================================================
// PERFORMANCE TEST
// ======================================================

test(
  'Microsite API Performance @performance',

  async ({ request }) => {

    const buyerId =
      uniqueBuyerId();

    const start =
      Date.now();

    const {
      responseBody
    } =
      await sendMicrositeRequest(
        request,
        `Harsha with ID ${buyerId} for Abhee Tranquila`
      );

    const ms =
      Date.now() - start;

    console.log(
      `Response time: ${ms} ms`
    );

    assertSuccess(
      responseBody
    );

    expect(ms)
      .toBeLessThan(5000);

  }
);

// ======================================================
// SUSPENDED ORGANIZATION
// ======================================================

test(
  'Suspended Organization Validation @regression',

  async ({ request }) => {

    const buyerId =
      uniqueBuyerId();

    const {
      responseBody
    } =
      await sendMicrositeRequest(
        request,
        `Harsha with ID ${buyerId} for Abhee Tranquila`,
        PHONE.SUSPENDED
      );

    assertFailure(
      responseBody
    );

  }
);

// ======================================================
// INACTIVE BROKER
// ======================================================

test(
  'Inactive Broker Validation @regression',

  async ({ request }) => {

    const buyerId =
      uniqueBuyerId();

    const {
      responseBody
    } =
      await sendMicrositeRequest(
        request,
        `Harsha with ID ${buyerId} for Abhee Tranquila`,
        PHONE.INACTIVE
      );

    assertFailure(
      responseBody
    );

  }
);