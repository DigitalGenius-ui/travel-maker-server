export const getPasswordResetTemplate = (url) => ({
  subject: "Password Reset Request",
  text: `You requested a password reset. Click on the link to reset your password: ${url}`,
  html: `<!doctype html><html lang="en-US"><head><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><title>Reset Password Email Template</title><meta name="description" content="Reset Password Email Template."><style type="text/css">a:hover{text-decoration:underline!important}</style></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0"><!--100%body table--><table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;"><tr><td><table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0"><tr><td style="height:80px;">&nbsp;</td></tr><tr><td style="text-align:center;"></a></td></tr><tr><td style="height:20px;">&nbsp;</td></tr><tr><td><table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"><tr><td style="height:40px;">&nbsp;</td></tr><tr><td style="padding:0 35px;"><h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have requested to reset your password</h1><span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span><p style="color:#455056; font-size:15px;line-height:24px; margin:0;">A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions.</p><a target="_blank" href="${url}" style="background:#2f89ff;text-decoration:none !important; font-weight:500; margin-top:24px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset Password</a></td></tr><tr><td style="height:40px;">&nbsp;</td></tr></table></td><tr><td style="height:20px;">&nbsp;</td></tr><tr><td style="text-align:center;"><p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy;</p></td></tr><tr><td style="height:80px;">&nbsp;</td></tr></table></td></tr></table><!--/100%body table--></body></html>`,
});

export const getVerifyEmailTemplate = (url) => ({
  subject: "Verify Email Address",
  text: `Click on the link to verify your email address: ${url}`,
  html: `<!doctype html><html lang="en-US"><head><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><title>Verify Email Address Email Template</title><meta name="description" content="Verify Email Address Email Template."><style type="text/css">a:hover{text-decoration:underline!important}</style></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0"><!--100%body table--><table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;"><tr><td><table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0"><tr><td style="height:80px;">&nbsp;</td></tr><tr><td style="text-align:center;"></a></td></tr><tr><td style="height:20px;">&nbsp;</td></tr><tr><td><table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"><tr><td style="height:40px;">&nbsp;</td></tr><tr><td style="padding:0 35px;"><h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Please verify your email address</h1><span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span><p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Click on the following link to verify your email address.</p><a target="_blank" href="${url}" style="background:#2f89ff;text-decoration:none !important; font-weight:500; margin-top:24px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Verify Email Address</a></td></tr><tr><td style="height:40px;">&nbsp;</td></tr></table></td><tr><td style="height:20px;">&nbsp;</td></tr><tr><td style="text-align:center;"><p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy;</p></td></tr><tr><td style="height:80px;">&nbsp;</td></tr></table></td></tr></table><!--/100%body table--></body></html>`,
});

export const getTicketTemplate = ({
  title,
  firstName,
  lastName,
  phone,
  email,
  travelDate,
  adult,
  child,
  totalPrice,
  verifyNumber,
  tourImage,
}) => ({
  subject: "Ticket has been issued",
  text: "Please recive your ticket.",
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Tour Ticket</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f9f9f9;
      padding: 2rem;
      display: flex;
      justify-content: center;
    }

    .ticket {
      max-width: 600px;
      background: white;
      border: 2px dashed #333;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .ticket-header {
      background-color: #007bff;
      color: white;
      text-align: center;
      padding: 1rem;
    }

    .ticket-header h1 {
      margin: 0;
      font-size: 1.8rem;
    }

    .ticket-body {
      padding: 1.5rem;
    }

    .ticket-body img {
      width: 100%;
      height: auto;
      border-radius: 5px;
      margin-bottom: 1rem;
    }

    .info-row {
      margin-bottom: 1rem;
    }

    .info-row strong {
      display: inline-block;
      width: 120px;
    }

    .ticket-footer {
      border-top: 1px solid #ddd;
      padding: 1rem 1.5rem;
      background-color: #f1f1f1;
      font-size: 0.9rem;
    }

    .verify-code {
      font-weight: bold;
      color: #d63384;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .ticket {
        box-shadow: none;
        border: 2px solid black;
      }
    }
  </style>
</head>
<body>

  <div class="ticket">
    <div class="ticket-header">
      <h1 id="title">${title}</h1>
    </div>

    <div class="ticket-body">
      <img id="tourImage" src=${tourImage} alt="Tour Image"/>

      <div class="info-row"><strong>Name:</strong> <span id="name">${firstName} ${lastName}</span></div>
      <div class="info-row"><strong>Phone:</strong> <span id="phone">${phone}</span></div>
      <div class="info-row"><strong>Email:</strong> <span id="email">${email}</span></div>
      <div class="info-row"><strong>Travel Date:</strong> <span id="travelDate">${travelDate}</span></div>
      <div class="info-row"><strong>Adults:</strong> <span id="adult">${adult}</span></div>
      <div class="info-row"><strong>Children:</strong> <span id="child">${child}</span></div>
      <div class="info-row"><strong>Total Price:</strong> <span id="totalPrice">$${totalPrice}</span></div>
    </div>

    <div class="ticket-footer">
      <div>Verification Number: <span class="verify-code" id="verifyNumber">${verifyNumber}</span></div>
    </div>
  </div>
</body>
</html>
`,
});
