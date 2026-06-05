"""Email sending via Gmail SMTP."""
import os
import smtplib
from email.message import EmailMessage
from typing import List, Optional, Tuple


def send_email_with_attachment(
    recipients: List[str],
    subject: str,
    body: str,
    attachment_name: str,
    attachment_bytes: bytes,
    extra_attachments: Optional[List[Tuple[str, bytes, str]]] = None,
) -> dict:
    """Send an email with the generated DOCX attached.

    Uses Gmail SMTP via app password. Reads GMAIL_USER / GMAIL_APP_PASSWORD from env.
    """
    gmail_user = os.environ.get("GMAIL_USER", "").strip()
    gmail_pass = os.environ.get("GMAIL_APP_PASSWORD", "").strip()

    if not gmail_user or not gmail_pass:
        return {
            "ok": False,
            "error": "Gmail credentials not configured. Adăugați GMAIL_USER și GMAIL_APP_PASSWORD în setări.",
        }

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = gmail_user
    msg["To"] = ", ".join(recipients)
    msg.set_content(body or "")

    # Main DOCX attachment
    msg.add_attachment(
        attachment_bytes,
        maintype="application",
        subtype="vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=attachment_name,
    )

    # Extra attachments (e.g. signature .p7s)
    for name, data, mime in (extra_attachments or []):
        maintype, subtype = mime.split("/", 1) if "/" in mime else ("application", "octet-stream")
        msg.add_attachment(data, maintype=maintype, subtype=subtype, filename=name)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=20) as server:
            server.login(gmail_user, gmail_pass)
            server.send_message(msg)
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": f"SMTP error: {str(e)}"}
