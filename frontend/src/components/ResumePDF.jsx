import { forwardRef } from 'react'

const ResumePDF = forwardRef(({ user, documents }, ref) => {
    // Filter documents by category
    const academics = documents.filter(doc => doc.category === 'Academics')
    const internships = documents.filter(doc => doc.category === 'Internships')
    const projects = documents.filter(doc => doc.category === 'Projects')
    const certifications = documents.filter(doc => doc.category === 'Certifications')

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        })
    }

    // Portfolio link - use localhost for development
    const portfolioLink = `http://localhost:5173/portfolio/${user.username}`

    return (
        <div ref={ref} style={{
            width: '8.5in',
            minHeight: '11in',
            margin: '0 auto',
            padding: '0.75in',
            backgroundColor: '#FFFFFF',
            color: '#1F2937',
            fontFamily: 'Inter, sans-serif',
            fontSize: '11pt',
            lineHeight: '1.6'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', textAlign: 'center', borderBottom: '2px solid #1E3A8A', paddingBottom: '16px' }}>
                <h1 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '28pt',
                    fontWeight: 600,
                    color: '#1E3A8A',
                    margin: '0 0 8px 0',
                    letterSpacing: '-0.5px'
                }}>
                    {user.name}
                </h1>
                <div style={{
                    margin: '8px 0',
                    fontSize: '10pt',
                    color: '#4B5563',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    <span>{user.email}</span>
                    <span>•</span>
                    <a href={portfolioLink} style={{
                        color: '#0D9488',
                        textDecoration: 'none',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        🔗 View Verified Portfolio →
                    </a>
                </div>

                {/* Verification Badge */}
                <div style={{
                    marginTop: '12px',
                    padding: '6px 12px',
                    backgroundColor: '#F0FDFA',
                    border: '1px solid #0D9488',
                    borderRadius: '6px',
                    display: 'inline-block',
                    fontSize: '9pt',
                    color: '#0F766E',
                    fontWeight: 500
                }}>
                    🛡️ Securely Verified by EduVault
                </div>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '14pt',
                    fontWeight: 600,
                    color: '#1E3A8A',
                    margin: '0 0 12px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1.5px solid #0D9488',
                    paddingBottom: '4px'
                }}>
                    Summary
                </h2>
                <p style={{ margin: '0', fontSize: '11pt', color: '#4B5563', lineHeight: '1.6' }}>
                    {user.degree} student at {user.university} specializing in {user.branch}.
                    Experienced in {internships.length > 0 ? 'professional internships' : 'academic projects'} with
                    a strong foundation in technical skills and {certifications.length} professional certifications.
                    Expected graduation: {user.graduationYear}.
                </p>
            </div>

            {/* Education */}
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '14pt',
                    fontWeight: 600,
                    color: '#1E3A8A',
                    margin: '0 0 12px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1.5px solid #0D9488',
                    paddingBottom: '4px'
                }}>
                    Education
                </h2>

                {/* University Details */}
                <div style={{ marginBottom: academics.length > 0 ? '16px' : '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h3 style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '12pt',
                            fontWeight: 500,
                            color: '#1F2937',
                            margin: '0'
                        }}>
                            {user.university}
                        </h3>
                        <span style={{
                            fontSize: '10pt',
                            color: '#6B7280',
                            fontFamily: 'JetBrains Mono, monospace'
                        }}>
                            Expected {user.graduationYear}
                        </span>
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '11pt', color: '#4B5563' }}>
                        {user.degree} in {user.branch}
                    </p>
                </div>

                {/* Academic Documents (Marksheets, etc.) */}
                {academics.length > 0 && (
                    <div style={{ marginLeft: '20px', marginTop: '12px' }}>
                        <p style={{
                            fontSize: '10pt',
                            fontWeight: 500,
                            color: '#6B7280',
                            margin: '0 0 8px 0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px'
                        }}>
                            Academic Records:
                        </p>
                        {academics.map((doc, index) => (
                            <div key={doc._id} style={{
                                marginBottom: index < academics.length - 1 ? '6px' : '0',
                                paddingLeft: '12px',
                                borderLeft: '2px solid #E5E7EB'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{
                                        fontSize: '10pt',
                                        color: '#4B5563'
                                    }}>
                                        • {doc.originalName.replace(/\.[^/.]+$/, '')}
                                    </span>
                                    <span style={{
                                        fontSize: '9pt',
                                        color: '#9CA3AF',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        marginLeft: '8px'
                                    }}>
                                        {formatDate(doc.uploadDate)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Experience */}
            {internships.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '14pt',
                        fontWeight: 600,
                        color: '#1E3A8A',
                        margin: '0 0 12px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1.5px solid #0D9488',
                        paddingBottom: '4px'
                    }}>
                        Experience
                    </h2>
                    {internships.slice(0, 3).map((doc, index) => (
                        <div key={doc._id} style={{ marginBottom: index < Math.min(internships.length, 3) - 1 ? '16px' : '0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <h3 style={{
                                    fontFamily: 'Outfit, sans-serif',
                                    fontSize: '12pt',
                                    fontWeight: 500,
                                    color: '#1F2937',
                                    margin: '0'
                                }}>
                                    {doc.originalName.replace(/\.[^/.]+$/, '')}
                                </h3>
                                <span style={{
                                    fontSize: '10pt',
                                    color: '#6B7280',
                                    fontFamily: 'JetBrains Mono, monospace'
                                }}>
                                    {formatDate(doc.uploadDate)}
                                </span>
                            </div>
                            <p style={{ margin: '4px 0 0 0', fontSize: '10pt', color: '#6B7280', fontStyle: 'italic' }}>
                                Details available in verified portfolio
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills & Certifications */}
            {certifications.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '14pt',
                        fontWeight: 600,
                        color: '#1E3A8A',
                        margin: '0 0 12px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1.5px solid #0D9488',
                        paddingBottom: '4px'
                    }}>
                        Skills & Certifications
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {certifications.map((doc) => (
                            <span key={doc._id} style={{
                                fontSize: '10pt',
                                color: '#1F2937',
                                padding: '4px 12px',
                                backgroundColor: '#F3F4F6',
                                borderRadius: '4px',
                                border: '1px solid #E5E7EB'
                            }}>
                                {doc.originalName.replace(/\.[^/.]+$/, '')}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '14pt',
                        fontWeight: 600,
                        color: '#1E3A8A',
                        margin: '0 0 12px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1.5px solid #0D9488',
                        paddingBottom: '4px'
                    }}>
                        Projects
                    </h2>
                    {projects.slice(0, 3).map((doc, index) => (
                        <div key={doc._id} style={{ marginBottom: index < Math.min(projects.length, 3) - 1 ? '12px' : '0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <h3 style={{
                                    fontFamily: 'Outfit, sans-serif',
                                    fontSize: '11pt',
                                    fontWeight: 500,
                                    color: '#1F2937',
                                    margin: '0'
                                }}>
                                    {doc.originalName.replace(/\.[^/.]+$/, '')}
                                </h3>
                                <span style={{
                                    fontSize: '10pt',
                                    color: '#6B7280',
                                    fontFamily: 'JetBrains Mono, monospace'
                                }}>
                                    {formatDate(doc.uploadDate)}
                                </span>
                            </div>
                            <p style={{
                                margin: '4px 0 0 0',
                                fontSize: '10pt',
                                color: '#6B7280',
                                lineHeight: '1.4',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                Project documentation and details available in verified digital portfolio.
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div style={{
                marginTop: '32px',
                paddingTop: '16px',
                borderTop: '1px solid #E5E7EB',
                textAlign: 'center',
                fontSize: '9pt',
                color: '#9CA3AF'
            }}>
                <p style={{ margin: '0' }}>
                    All credentials verified via EduVault • View full portfolio: {portfolioLink}
                </p>
            </div>
        </div>
    )
})

ResumePDF.displayName = 'ResumePDF'

export default ResumePDF
