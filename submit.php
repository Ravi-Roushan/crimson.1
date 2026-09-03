<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Only POST requests allowed"]);
    exit;
}

// Get JSON post data
$raw_data = file_get_contents("php://input");
$data = json_decode($raw_data, true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "No data received"]);
    exit;
}

$formType = isset($data['formType']) ? $data['formType'] : '';
$fullname = isset($data['fullname']) ? $data['fullname'] : '';
$phone = isset($data['phone']) ? $data['phone'] : '';
$email = isset($data['email']) ? $data['email'] : '';
$explore = isset($data['explore']) ? $data['explore'] : null;
$message = isset($data['message']) ? $data['message'] : '';

$recipientEmail = 'akashjadhav32004@gmail.com';

// 1. Build Notification Email to Company
$isPrivatePreview = ($formType === 'private-preview');
$formTitle = $isPrivatePreview ? 'Private Preview Access Request' : 'New Client Inquiry';

$optionsHtml = '';
if ($explore && is_array($explore)) {
    $optionsHtml = '<ul>';
    foreach ($explore as $opt) {
        $cleanOpt = strtoupper(str_replace('-', ' ', $opt));
        $optionsHtml .= "<li>$cleanOpt</li>";
    }
    $optionsHtml .= '</ul>';
} elseif ($explore) {
    $optionsHtml = '<ul><li>' . strtoupper($explore) . '</li></ul>';
} else {
    $optionsHtml = 'None selected';
}

$companyMailHtml = '
<div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #c9a96e; padding: 24px; border-radius: 8px; background-color: #fcfcfc;">
  <h2 style="color: #4A0707; border-bottom: 2px solid #c9a96e; padding-bottom: 12px; margin-top: 0;">' . $formTitle . ' Received</h2>
  <table style="width: 100%; border-collapse: collapse; margin-top: 18px;">
    <tr>
      <td style="padding: 8px 0; font-weight: bold; width: 150px; color: #555;">Full Name:</td>
      <td style="padding: 8px 0; color: #222;">' . htmlspecialchars($fullname) . '</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; color: #555;">Contact Number:</td>
      <td style="padding: 8px 0; color: #222;">' . htmlspecialchars($phone) . '</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-weight: bold; color: #555;">Email ID:</td>
      <td style="padding: 8px 0; color: #222;">' . htmlspecialchars($email) . '</td>
    </tr>';

if ($isPrivatePreview) {
    $companyMailHtml .= '
    <tr>
      <td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Interests:</td>
      <td style="padding: 8px 0; color: #222;">' . $optionsHtml . '</td>
    </tr>';
} else {
    $companyMailHtml .= '
    <tr>
      <td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Message:</td>
      <td style="padding: 8px 0; color: #222; white-space: pre-wrap;">' . nl2br(htmlspecialchars($message)) . '</td>
    </tr>';
}

$companyMailHtml .= '
  </table>
  <div style="margin-top: 24px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 12px;">
    Submitted via The Crimson Landing Page form.
  </div>
</div>';

// 2. Build Thank You Email to User
$exploreText = '';
if ($explore && is_array($explore)) {
    $exploreText = strtoupper(str_replace('-', ' ', implode(', ', $explore)));
} elseif ($explore) {
    $exploreText = strtoupper($explore);
} else {
    $exploreText = 'Virtual Tour';
}

$userMailSubject = $isPrivatePreview ? "Thanks for booking a private preview - The Crimson" : "Thank you for your inquiry - The Crimson";
$introText = $isPrivatePreview 
    ? "Thank you for requesting private preview access to The Crimson, Borivali. We have received your request details successfully." 
    : "Thank you for reaching out to us. We have received your inquiry details successfully.";
$closingText = $isPrivatePreview 
    ? "Our dedicated relations team will connect with you shortly to curate your personalized Crimson experience and schedule your private walk-through." 
    : "Our dedicated relations team has received your message and will get back to you shortly to assist with your query.";

$userMailHtml = '
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid rgba(74, 7, 7, 0.1); border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
  <div style="background-color: #4A0707; color: #F2E3D3; padding: 32px 24px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">THE CRIMSON</h1>
    <p style="margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #c9a96e;">Borivali West</p>
  </div>
  <div style="padding: 32px 24px; background-color: #ffffff; color: #333; line-height: 1.6;">
    <p style="font-size: 16px; margin-top: 0;">Dear <strong>' . htmlspecialchars($fullname) . '</strong>,</p>
    <p>' . $introText . '</p>
    
    <div style="background-color: #FCF5E5; border-left: 3px solid #c9a96e; padding: 18px; margin: 24px 0; border-radius: 4px;">
      <h4 style="margin: 0 0 8px 0; color: #4A0707; font-size: 14px;">Your Request Details:</h4>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #555;">
        <li><strong>Contact Number:</strong> ' . htmlspecialchars($phone) . '</li>';

if ($isPrivatePreview) {
    $userMailHtml .= '<li><strong>Interests:</strong> ' . htmlspecialchars($exploreText) . '</li>';
}

$userMailHtml .= '
      </ul>
    </div>

    <p>' . $closingText . '</p>
    <p style="margin-bottom: 0;">Warm regards,<br /><strong>The Crimson Relationship Team</strong></p>
  </div>
  <div style="background-color: #f7f3eb; padding: 18px 24px; text-align: center; font-size: 11px; color: #666; border-top: 1px solid #eee;">
    The Crimson Sales Lounge, S.V. Road, Borivali West, Mumbai 400092<br />
    &copy; 2026 IM Buildcon. All Rights Reserved.
  </div>
</div>';

// Headers for HTML Mail
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= 'From: "The Crimson Borivali" <noreply@imbuildcon.in>' . "\r\n";

// Send Alert to Company
$mail1 = mail($recipientEmail, "[ALERT] $formTitle - $fullname", $companyMailHtml, $headers);

// Send Thank You to User
$mail2 = false;
if (!empty($email)) {
    $mail2 = mail($email, $userMailSubject, $userMailHtml, $headers);
}

if ($mail1) {
    echo json_encode(["success" => true, "message" => "Form submitted successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Server mail configuration error."]);
}
?>
