"""Email sending via Gmail SMTP using each user's own credentials."""
import smtplib
from email.message import EmailMessage
from typing import List, Optional, Tuple


def send_email_with_attachment(
    gmail_user: str,
    gmail_password: str,
    recipients: List[str],
    subject: str,
    body: str,
    attachment_name: str,
    attachment_bytes: bytes,
    extra_attachments: Optional[List[Tuple[str, bytes, str]]] = None,
) -> dict:
    """Send an email with the generated DOCX attached using the user's own Gmail.

    Each authenticated user provides their own GMAIL_USER + GMAIL_APP_PASSWORD
    via the Settings page (stored on the user document).
    """
    if not gmail_user or not gmail_password:
        return {
            "ok": False,
            "error": "Adresa Gmail nu este configurată. Mergeți la Setări → Configurare email pentru a o adăuga.",
        }

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = gmail_user
    msg["To"] = ", ".join(recipients)
    msg.set_content(body or "")

    msg.add_attachment(
        attachment_bytes,
        maintype="application",
        subtype="vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=attachment_name,
    )

    for name, data, mime in (extra_attachments or []):
        maintype, subtype = mime.split("/", 1) if "/" in mime else ("application", "octet-stream")
        msg.add_attachment(data, maintype=maintype, subtype=subtype, filename=name)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=20) as server:
            server.login(gmail_user, gmail_password)
            server.send_message(msg)
        return {"ok": True}
    except smtplib.SMTPAuthenticationError:
        return {"ok": False, "error": "Autentificare Gmail eșuată. Verificați adresa și App Password-ul (16 caractere)."}
    except Exception as e:
        return {"ok": False, "error": f"Eroare SMTP: {str(e)}"}
