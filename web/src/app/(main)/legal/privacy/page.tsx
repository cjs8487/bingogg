import { Container, Typography } from '@mui/material';

export default function Privacy() {
    return (
        <Container sx={{ pt: 2 }}>
            <Typography variant="h4" component="h1">
                Privacy Policy
            </Typography>
            <Typography sx={{ pb: 1.5 }}>
                Welcome to bingo.gg! Your privacy is important to us, and we are
                committed to protecting the personal information that you share
                with us. This Privacy Policy outlines how we collect, use, and
                safeguard your information when you visit our website.
            </Typography>
            <Typography sx={{ pb: 3 }}>
                By choosing to use bingo.gg, you agree to the collection and use
                of information in relation with this policy. The Personal
                Information that we collect are used for providing and improving
                our service. We will not use or share your information with
                anyone except as described in this Privacy Policy.
            </Typography>
            <Typography variant="h5">Information We Collect</Typography>
            <Typography sx={{ pb: 1.5 }}>
                We may collect personal information such as your username and
                email address when you register for an account. This information
                is used solely for account management purposes. We also collect
                information when you connect to and interact with a room,
                including your nickname, room actions, and chat messages. This
                information is used solely to provide the service, including
                preserving room history.
            </Typography>
            <Typography sx={{ pb: 3 }}>
                We also collect non-personal information, such as your IP
                address, browser type, and device information, to improve our
                website&#39;s functionality and user experience. This
                information is collected through cookies and similar
                technologies.
            </Typography>
            <Typography variant="h5">How We Use Your Information</Typography>
            <Typography sx={{ pb: 1.5 }}>
                Your personal information is used for account management and
                communication regarding account-related matters. We do not share
                your information with third parties without permission.
            </Typography>
            <Typography sx={{ pb: 3 }}>
                Non-personal information is used for website analytics,
                improving our services, and enhancing the overall user
                experience.
            </Typography>
            <Typography variant="h5">Data Security</Typography>
            <Typography sx={{ pb: 3 }}>
                We employ industry-standard security measures to protect your
                personal information from unauthorized access, disclosure,
                alteration, and destruction. We ensure that your data is treated
                with the utmost confidentiality and care.
            </Typography>
            <Typography variant="h5">Cookies</Typography>
            <Typography sx={{ pb: 3 }}>
                bingo.gg uses cookies to enhance your experience on our website.
                You may choose to disable cookies through your browser settings,
                but please note that some features of the site may not function
                properly without them.
            </Typography>
            <Typography variant="h5">Third-Party Links</Typography>
            <Typography sx={{ pb: 3 }}>
                Our website may contain links to third-party websites. Please be
                aware that we are not responsible for the privacy practices or
                content of these external sites. We encourage you to review the
                privacy policies of these third parties.
            </Typography>
            <Typography variant="h5">Changes to the Privacy Policy</Typography>
            <Typography sx={{ pb: 3 }}>
                We reserve the right to update or modify this Privacy Policy at
                any time. Any changes will be effective immediately upon posting
                on our website. We recommend reviewing this policy periodically
                for any updates.
            </Typography>
            <Typography variant="h5">Contact Us</Typography>
            <Typography sx={{ pb: 3 }}>
                If you have any questions or concerns regarding our Privacy
                Policy, please contact us at{' '}
                <a href="mailto:staff@bingothon.com">staff@bingothon.com</a>.
                Thank you for choosing bingo.gg! Enjoy your game in a secure and
                private environment.
            </Typography>
        </Container>
    );
}
