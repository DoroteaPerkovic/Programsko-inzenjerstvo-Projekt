import ssl
from django.core.mail.backends.smtp import EmailBackend as SmtpEmailBackend

class CustomEmailBackend(SmtpEmailBackend):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ssl_context = self._create_unverified_context()

    def _create_unverified_context(self):
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        return context

    def open(self):
        if self.connection:
            return False
        try:
            self.connection = self.connection_class(
                self.host, self.port, **self.connection_params
            )
            if self.use_ssl:
                self.connection.starttls(context=self.ssl_context)
            return True
        except Exception:
            if not self.fail_silently:
                raise
            return False
