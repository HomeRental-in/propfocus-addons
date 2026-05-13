import { test, expect } from '@playwright/test';

test('Microsite Generation @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Arhan Sk B123 needs brochure for Aamrut'
        }
      }
    }
  );

  // Verify status code
  expect(response.status()).toBe(200);

  // Parse response JSON
  const responseBody = await response.json();

  // Verify success
  expect(responseBody.success).toBe(true);

  // Verify microsite URL exists
//   expect(responseBody.micrositeURL).toBeTruthy();

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with ALL CAPS message @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'ARHAN SK B123 NEEDS BROCHURE FOR AAMRUT'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  expect(responseBody.success).toBe(true);
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with different sentence structure @sanity', async ({ request }) => {
    const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'For Abhee Tranquila, generate for Harsha with ID 1234'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  expect(responseBody.success).toBe(true);
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with Mr prefix @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Mr. Arhan B123 needs brochure for Aamrut'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  expect(responseBody.micrositeUrl).toBeTruthy();

  console.log(JSON.stringify(responseBody, null, 2));

});

test('Microsite Generation with Mr name format @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Mr Arhan Sk B123 needs brochure for Aamrut'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  expect(responseBody.micrositeUrl).toBeTruthy();

  console.log(JSON.stringify(responseBody, null, 2));

});

test('Microsite Generation with Dr prefix @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Dr Arhan B123 needs brochure for Aamrut'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  expect(responseBody.micrositeUrl).toBeTruthy();

  console.log(JSON.stringify(responseBody, null, 2));

});

test('Microsite Generation with Shri prefix @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Shri Arhan B123 needs brochure for Aamrut'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  expect(responseBody.micrositeUrl).toBeTruthy();

  console.log(JSON.stringify(responseBody, null, 2));

});

test('Microsite Generation with partial name @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha interested at Sampada'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with multiple project options @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha with ID 2345 for all projects'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with wrong spelling @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha for Abhee Tranqula with ID 2345'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with half project name @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha A343 for Tranquila'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with for phases @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha with ID K987 for KNS Samooha Phase 3'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with for partial phase name @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha with ID A781 for Ananta'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with explicit phase number @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha for Ananta Phase 5'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  console.log(JSON.stringify(responseBody, null, 2));
    expect(responseBody.micrositeUrl).toBeTruthy();

});


test('Microsite Generation with abbreviated phase name @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha with ID 1242 for Ananta P1'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with codename short form @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha for KNS'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with mixed case input @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'HaRsHa with Id I891 FoR AbHeE TrAnQuIlA'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with explicit generate request @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Please generate for Harsha with ID B123 in Abhee Tranquila'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with phone number and interest statement @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: '9650355568 Aakash is interested in Abhee Aaria'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.micrositeUrl).toBeTruthy();
});

test('Microsite Generation with multiple customer requests @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha for Abhee Tranquila and Raj for KNS Sampada'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.success).toBe(true);

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with invalid project name @regression', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha for XYZ Project'
        }
      }
    }
  );

  // Verify API response received
  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  // Verify microsite should NOT generate for invalid project
  expect(responseBody.success).not.toBe(true);
  expect(responseBody.micrositeUrl).toBeFalsy();

});

test('Microsite Generation with missing customer name @regression', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'for Abhee Tranquila'
        }
      }
    }
  );

  // Verify API response received
  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  // Verify request should not generate valid microsite
  expect(responseBody.success).not.toBe(true);
  expect(responseBody.micrositeUrl).toBeFalsy();
});

test('Microsite Generation with numeric customer name @regression', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: '12345 for Abhee Tranquila'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  // Invalid customer name should not generate microsite
  expect(responseBody.success).not.toBe(true);

  expect(responseBody.micrositeUrl).toBeFalsy();
});

test('Microsite Generation with special characters only @regression', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: '@@@ ### $$$'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  // Invalid format should not generate microsite
  expect(responseBody.success).not.toBe(true);

  expect(responseBody.micrositeUrl).toBeFalsy();
});

test('Microsite Generation with multiple projects and customer ID @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha B123 for Abhee Tranquila and KNS Sampada'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  expect(responseBody.success).toBe(true);

});

test('Microsite Generation with multiple farm project names @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha B123 for KNS Sampada, Samruddhi Farms, Sampada, Samooha, Abhirudhi'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  expect(responseBody.success).toBe(true);

});

test('Microsite Generation with incomplete customer ID format @regression', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha with ID for Abhee Tranquila'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  // Missing actual ID value should not generate valid microsite
  expect(responseBody.success).not.toBe(true);

});

test('Microsite Generation without valid buyer ID @regression', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha with ID @14@ for Abhee Tranquila'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  // Microsite should not generate without valid buyer ID
  expect(responseBody.success).not.toBe(true);

});

test('Microsite Generation with multiple spaces in customer name @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Aakash                    Bhatnagar with ID A344 for Abhee Aria'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  expect(responseBody.success).toBe(true);

});

test('Microsite Generation with multi-line input @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: `Rahul Sharma
Abhee Tranquila
KNS Sampada`
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  expect(responseBody.success).toBe(true);

});

test('Microsite Generation with dash separated input @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha with ID A143 - Abhee Tranquila'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  expect(responseBody.success).toBe(true);
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with buyer ID and dash separator @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha - B123 - Abhee Tranquila'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  expect(responseBody.success).toBe(true);
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with mixed delimiters @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'Harsha - Abhee / Tranquila'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  expect(responseBody.success).toBe(true);
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test('Microsite Generation with emoji and special characters @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: '🏠 Harsha with ID k131 for Abhee Tranquila'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  expect(responseBody.success).toBe(true);
  expect(responseBody.micrositeUrl).toBeTruthy();
});

test('Microsite Generation with apostrophe in customer name @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: "O'Brien with ID A143 for Abhee Tranquila"
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  expect(responseBody.success).toBe(true);
  expect(responseBody.micrositeUrl).toBeTruthy();

});

test.only('Microsite Generation with accented characters in customer name @sanity', async ({ request }) => {

  const response = await request.post(
    'https://dev.propfocus.in/api/whatsapp-webhook',
    {
      data: {
        event: 'message',
        data: {
          from: '+918374095506',
          body: 'José with ID A143 for Abhee Tranquila'
        }
      }
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));

  expect(responseBody.success).toBe(true);
  expect(responseBody.micrositeUrl).toBeTruthy();

});