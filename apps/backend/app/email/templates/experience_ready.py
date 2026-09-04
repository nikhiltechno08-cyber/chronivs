"""Premium HTML + plain-text email for published Chronivs experiences."""

from __future__ import annotations

import html
from dataclasses import dataclass


@dataclass(frozen=True)
class ExperienceReadyEmailContent:
    subject: str
    html: str
    text: str


def build_experience_ready_email(
    *,
    customer_name: str,
    recipient_name: str,
    occasion: str,
    public_url: str,
    support_email: str = "support@chronivs.com",
    preview_thumbnail_url: str | None = None,
) -> ExperienceReadyEmailContent:
    """Build sanitized, responsive HTML + plain text bodies."""
    safe_customer = html.escape((customer_name or "there").strip() or "there")
    safe_recipient = html.escape((recipient_name or "someone special").strip() or "someone special")
    safe_occasion = html.escape((occasion or "a special occasion").strip() or "a special occasion")
    safe_url = html.escape(public_url.strip(), quote=True)
    safe_url_display = html.escape(public_url.strip())
    safe_support = html.escape((support_email or "support@chronivs.com").strip())

    thumb_block = ""
    if preview_thumbnail_url and preview_thumbnail_url.startswith("https://"):
        safe_thumb = html.escape(preview_thumbnail_url, quote=True)
        thumb_block = f"""
          <tr>
            <td style="padding: 0 32px 24px;">
              <img src="{safe_thumb}" alt="Experience preview" width="536"
                style="display:block;width:100%;max-width:536px;height:auto;border-radius:16px;border:1px solid rgba(230,193,90,0.25);" />
            </td>
          </tr>
        """

    subject = "✨ Your Chronivs Experience is Ready!"

    html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{html.escape(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#0b0407;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0407;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0"
          style="width:100%;max-width:600px;background:linear-gradient(180deg,#1a0f14 0%,#12080c 100%);border:1px solid rgba(230,193,90,0.22);border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:36px 32px 12px;text-align:center;">
              <div style="font-size:13px;letter-spacing:0.28em;text-transform:uppercase;color:#e6c15a;">Chronivs</div>
              <div style="margin-top:8px;font-size:28px;line-height:1.2;color:#f7ecdd;font-style:italic;">Your experience is ready</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 0;text-align:center;color:#d8c4b0;font-size:16px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
              Congratulations, {safe_customer}.
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 8px;text-align:center;color:#cbb6a4;font-size:15px;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
              Thank you for creating with Chronivs. Your cinematic experience for
              <strong style="color:#f7ecdd;">{safe_recipient}</strong>
              ({safe_occasion}) has been successfully published and is ready to open.
            </td>
          </tr>
          {thumb_block}
          <tr>
            <td align="center" style="padding:12px 32px 8px;">
              <a href="{safe_url}"
                style="display:inline-block;padding:14px 28px;border-radius:999px;background:linear-gradient(180deg,#f3dc9a,#e6c15a);color:#2a1a0a;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">
                Open Experience
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 8px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#a99282;">
              Share this link with {safe_recipient} whenever you are ready:<br />
              <a href="{safe_url}" style="color:#e6c15a;word-break:break-all;">{safe_url_display}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 36px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#7d675a;">
              Need help? Contact us at
              <a href="mailto:{safe_support}" style="color:#e6c15a;text-decoration:none;">{safe_support}</a>
              <br /><br />
              © Chronivs · Crafted moments, beautifully delivered.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    text_body = (
        f"✨ Your Chronivs Experience is Ready!\n\n"
        f"Congratulations, {customer_name or 'there'}.\n\n"
        f"Thank you for creating with Chronivs. Your experience for "
        f"{recipient_name or 'someone special'} ({occasion or 'a special occasion'}) "
        f"has been successfully published.\n\n"
        f"Open Experience:\n{public_url}\n\n"
        f"You can share this link with the recipient whenever you are ready.\n\n"
        f"Need help? Contact {support_email or 'support@chronivs.com'}\n\n"
        f"— Chronivs\n"
    )

    return ExperienceReadyEmailContent(subject=subject, html=html_body, text=text_body)
