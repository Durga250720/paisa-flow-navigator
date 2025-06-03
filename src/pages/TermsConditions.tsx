import styles from '../components/styles/PrivacyPolicy.module.css'

const TermsConditions = () => {
    const termsConditions = [
        {
            title:"1. Acceptance of Terms",
            point1:"These Terms & Conditions (“Terms”) govern your access to and use of the loan services provided by Paisa 108 (“we,” “us,” or “our”). By registering or applying for a loan, you agree to be legally bound by these Terms.",
        },
        {
            title:"2. Eligibility",
            point1:"Our services are available to:",
            subPoints:[
                "Indian residents aged 18 years or older",
                "Individuals with a valid government-issued ID (e.g., Aadhar, PAN)",
                "Users with low or no credit scores",
                "Individuals with limited or poor financial history"
            ],
            point2:"We reserve the right to deny service if you provide false or misleading information."
        },
        {
            title:"3. Loan Services",
            point1:"We offer small-ticket, short-term loans to help users manage urgent financial needs. These include:",
            subPoints:[
                "Low principal amounts",
                "Short repayment tenures",
                "Simple eligibility requirements"
            ],
            point2:"All loans are subject to approval and availability."
        },
        {
            title:"4. Data Security",
            point1:"We use industry-standard encryption, firewalls, and secure servers to protect your data from unauthorized access, loss, or misuse. Only authorized staff can access your data."
        },
        {
            title:"5. Limitation of Liability",
            point1:"We are not liable for:",
            subPoints:[
                "Any loss or damage arising from your use of the loan or the website",
                "Delays, errors, or service interruptions",
                "Any financial decision you make based on our services"
            ],
            point2:"Use of our services is at your own risk."
        },
        {
            title:"6. Termination of Service",
            point1:"We  reserve the right to suspend or terminate your access if:",
            subPoints:[
                "You breach any of these Terms",
                "You provide false information",
                "You misuse the platform or services"
            ]
        },
        {
            title:'7. Amendments to Terms',
            point1:"We may update these Terms at any time. Continued use of the website after changes means you accept the revised Terms. The latest version will always be available on this page."
        },
        {
            title:"8. Governing Law",
            point1:"These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of courts located in [Insert City/State]."
        }
    ]
    
    return(
        <div className={`${styles.mainContainer} h-[100vh] w-full`}>
            <div className={`${styles.innerContainer}`}>
                <div className={`${styles.containerTitle}`}>Terms & Conditions</div>
                <div className={`${styles.privacyRenderingContainer} mt-6 space-y-6`}>
                    {termsConditions.map((section, index) => (
                        <div key={index} className={styles.section}>
                            <div className={styles.sectionTitle}>{section.title}</div>
                            {section.point1 && (
                                <p className={`${styles.point} ml-4`}>{section.point1}</p>
                            )}
                            {section.subPoints && section.subPoints.length > 0 && (
                                <ul className={`${styles.subPointsList} list-disc list-inside ml-4 mt-2 space-y-1`}>
                                    {section.subPoints.map((subPoint, subIndex) => (
                                        <li key={subIndex} className={`${styles.subPointItem} leading-relaxed ml-4`}>{subPoint}</li>
                                    ))}
                                </ul>
                            )}
                            {section.point2 && (
                                <p className={`${styles.point} mt-2 ml-4`}>{section.point2}</p>
                            )}
                        </div>
                    ))}    
                </div>
            </div>
        </div>
    );
}

export default TermsConditions;