import styles from '../components/styles/PrivacyPolicy.module.css'

const PrivacyPolicy = () => {
    const privacyPolicyContent = [
        {
            title:"1. Information We Collect",
            point1:"We collect only the information necessary to process your loan application and improve our services, including:",
            subPoints:[
                "Personal Details: Name, age, gender, address, contact number, email",
                "Identification Proof: Aadhar, PAN",
                "Financial Information: Bank account details, income proofs, bank statements",
                "Credit Information: Credit score, past loan history (if available)",
                "Usage Data: How you use our website or app (browsing, clicks, etc.)"
            ]
        },
        {
            title:"2. How We Use Your Information",
            point1:"We use your information to:",
            subPoints:[
                "Process and evaluate your loan application",
                "Verify your identity and eligibility",
                "Disburse approved loan amounts",
                "Communicate with you regarding your loan status",
                "Send repayment reminders and updates",
                "Improve our services and user experience",
                "Report repayment behavior to credit bureaus (if applicable)"
            ]
        },
        {
            title:"3. Data Sharing and Disclosure",
            point1:"We do not sell your data. We may share your information only with:",
            subPoints:[
                "Authorized financial partners for loan processing",
                "Credit bureaus to help build your credit score",
                "Legal authorities if required under law",
                "Technology partners who help us run the website/app securely"
            ],
            point2:"We ensure all our partners follow strict data privacy and security measures"
        },
        {
            title:"4. Data Security",
            point1:"We use industry-standard encryption, firewalls, and secure servers to protect your data from unauthorized access, loss, or misuse. Only authorized staff can access your data."
        },
        {
            title:"5. Cookies & Tracking",
            point1:"Our website may use cookies to personalize your experience. You can disable cookies in your browser settings, though it may limit functionality."
        },
        {
            title:"6. Updates to This Policy",
            point1:"We may update this policy from time to time. Any changes will be posted on this page with an updated effective date."
        }
    ]
    
    return(
        <div className={`${styles.mainContainer} h-[100vh] w-full`}>
            <div className={`${styles.innerContainer}`}>
                <div className={`${styles.containerTitle}`}>Privacy Policy</div>
                <div className={`${styles.privacyRenderingContainer} mt-6 space-y-6`}>
                    {privacyPolicyContent.map((section, index) => (
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

export default PrivacyPolicy;