export const applicationStatusUpdateTemplate = (jobTitle) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Application Update</title></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);">
    <div style="padding:32px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-align:center;"><h1 style="margin:0;font-size:28px;">Application Status Update</h1></div>
    <div style="padding:32px;line-height:1.6;color:#333;">
      <p>Hi there,</p>
      <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
      <p>Thank you for applying.</p>
    </div>
  </div>
</body>
</html>`;
