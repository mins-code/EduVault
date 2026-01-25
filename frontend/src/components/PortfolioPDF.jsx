import { forwardRef } from 'react'

const PortfolioPDF = forwardRef(({ user, documents }, ref) => {
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

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    // Timeline items (Internships + Academics)
    const timelineItems = [...internships, ...academics].sort((a, b) =>
        new Date(b.uploadDate) - new Date(a.uploadDate)
    )

    return (
        <div ref={ref} style={{
            width: '8.5in',
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            color: '#1F2937',
            fontFamily: 'Inter, sans-serif',
            fontSize: '11pt'
        }}>
            {/* Hero Profile Section */}
            <div style={{
                padding: '60px 60px',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                textAlign: 'center',
                marginBottom: '48px'
            }}>
                {/* Verified Badge */}
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #38BDF8, #2DD4BF)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    boxShadow: '0 0 40px rgba(45, 212, 191, 0.5)'
                }}>
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h1 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '42pt',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    margin: '0 0 12px 0',
                    letterSpacing: '-1px'
                }}>
                    {user.name}
                </h1>

                <p style={{
                    fontSize: '16pt',
                    color: '#94A3B8',
                    margin: '0 0 6px 0',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    {user.degree} • {user.branch}
                </p>

                <p style={{
                    fontSize: '13pt',
                    color: '#64748B',
                    margin: '0 0 32px 0',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    {user.university} • Class of {user.graduationYear}
                </p>

                {/* Stats */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '40px',
                    marginTop: '24px'
                }}>
                    <div>
                        <p style={{
                            fontSize: '32pt',
                            fontWeight: 'bold',
                            color: '#38BDF8',
                            margin: '0',
                            fontFamily: 'Outfit, sans-serif'
                        }}>
                            {documents.length}
                        </p>
                        <p style={{
                            fontSize: '10pt',
                            color: '#94A3B8',
                            margin: '6px 0 0 0'
                        }}>
                            Verified Documents
                        </p>
                    </div>
                    <div>
                        <p style={{
                            fontSize: '32pt',
                            fontWeight: 'bold',
                            color: '#2DD4BF',
                            margin: '0',
                            fontFamily: 'Outfit, sans-serif'
                        }}>
                            {certifications.length}
                        </p>
                        <p style={{
                            fontSize: '10pt',
                            color: '#94A3B8',
                            margin: '6px 0 0 0'
                        }}>
                            Certifications
                        </p>
                    </div>
                    <div>
                        <p style={{
                            fontSize: '32pt',
                            fontWeight: 'bold',
                            color: '#818CF8',
                            margin: '0',
                            fontFamily: 'Outfit, sans-serif'
                        }}>
                            {projects.length}
                        </p>
                        <p style={{
                            fontSize: '10pt',
                            color: '#94A3B8',
                            margin: '6px 0 0 0'
                        }}>
                            Projects
                        </p>
                    </div>
                </div>

                {user.bio && (
                    <p style={{
                        fontSize: '12pt',
                        color: '#CBD5E1',
                        margin: '0 0 32px 0',
                        maxWidth: '80%',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        lineHeight: '1.6',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {user.bio}
                    </p>
                )}

                {/* Skills Chips */}
                {user.skills && user.skills.length > 0 && (
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '10px',
                        marginBottom: '40px',
                        maxWidth: '90%',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}>
                        {user.skills.map((skill, index) => (
                            <span key={index} style={{
                                padding: '6px 16px',
                                background: 'rgba(56, 189, 248, 0.1)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                borderRadius: '20px',
                                color: '#38BDF8',
                                fontSize: '10pt',
                                fontWeight: 500,
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                <div style={{
                    marginTop: '20px',
                    padding: '12px 24px',
                    background: 'rgba(45, 212, 191, 0.1)',
                    border: '1px solid rgba(45, 212, 191, 0.3)',
                    borderRadius: '6px',
                    display: 'inline-block'
                }}>
                    <p style={{
                        fontSize: '9pt',
                        color: '#2DD4BF',
                        margin: '0',
                        fontFamily: 'JetBrains Mono, monospace'
                    }}>
                        ✓ All credentials verified and secured via EduVault
                    </p>
                </div>
            </div>

            {/* Education Timeline */}
            {timelineItems.length > 0 && (
                <div style={{
                    padding: '0 60px 40px 60px'
                }}>
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '24pt',
                        fontWeight: 600,
                        color: '#1E3A8A',
                        margin: '0 0 32px 0',
                        textAlign: 'center'
                    }}>
                        Education & Experience Timeline
                    </h2>

                    {timelineItems.map((doc, index) => (
                        <div key={doc._id} style={{
                            marginBottom: '24px',
                            padding: '20px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            backgroundColor: '#F9FAFB',
                            position: 'relative'
                        }}>
                            {/* Verified Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                padding: '4px 10px',
                                background: 'rgba(45, 212, 191, 0.1)',
                                border: '1px solid #2DD4BF',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span style={{
                                    fontSize: '8pt',
                                    color: '#2DD4BF',
                                    fontWeight: 500
                                }}>
                                    Verified
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px'
                            }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '8px',
                                    background: doc.category === 'Internships'
                                        ? 'linear-gradient(135deg, #2DD4BF, #38BDF8)'
                                        : 'linear-gradient(135deg, #38BDF8, #818CF8)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <span style={{ fontSize: '18pt' }}>
                                        {doc.category === 'Internships' ? '💼' : '🎓'}
                                    </span>
                                </div>

                                <div style={{ flex: 1, paddingRight: '80px' }}>
                                    <h3 style={{
                                        fontFamily: 'Outfit, sans-serif',
                                        fontSize: '13pt',
                                        fontWeight: 500,
                                        color: '#1F2937',
                                        margin: '0 0 4px 0'
                                    }}>
                                        {doc.originalName.replace(/\.[^/.]+$/, '')}
                                    </h3>
                                    <p style={{
                                        fontSize: '9pt',
                                        color: '#6B7280',
                                        margin: '0',
                                        fontFamily: 'JetBrains Mono, monospace'
                                    }}>
                                        {formatDate(doc.uploadDate)} • {doc.category}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Projects Section */}
            {projects.length > 0 && (
                <div style={{
                    padding: '40px 60px',
                    backgroundColor: '#F9FAFB'
                }}>
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '24pt',
                        fontWeight: 600,
                        color: '#1E3A8A',
                        margin: '0 0 32px 0',
                        textAlign: 'center'
                    }}>
                        Projects Portfolio
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '20px'
                    }}>
                        {projects.map((doc) => (
                            <div key={doc._id} style={{
                                padding: '18px',
                                border: '2px solid #E5E7EB',
                                borderRadius: '10px',
                                backgroundColor: '#FFFFFF',
                                position: 'relative'
                            }}>
                                {/* Verified Badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: '14px',
                                    right: '14px',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: '#818CF8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>

                                {/* Project Icon */}
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #818CF8, #A78BFA)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '14px'
                                }}>
                                    <span style={{ fontSize: '24pt' }}>💻</span>
                                </div>

                                <h3 style={{
                                    fontFamily: 'Outfit, sans-serif',
                                    fontSize: '11pt',
                                    fontWeight: 500,
                                    color: '#1F2937',
                                    margin: '0 0 10px 0',
                                    lineHeight: '1.4',
                                    minHeight: '40px'
                                }}>
                                    {doc.originalName.replace(/\.[^/.]+$/, '')}
                                </h3>

                                <p style={{
                                    fontSize: '8pt',
                                    color: '#6B7280',
                                    margin: '0',
                                    fontFamily: 'JetBrains Mono, monospace'
                                }}>
                                    {formatDate(doc.uploadDate)} • {formatFileSize(doc.fileSize)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications Gallery */}
            {certifications.length > 0 && (
                <div style={{
                    padding: '40px 60px'
                }}>
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '24pt',
                        fontWeight: 600,
                        color: '#1E3A8A',
                        margin: '0 0 32px 0',
                        textAlign: 'center'
                    }}>
                        Certifications Gallery
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '20px'
                    }}>
                        {certifications.map((doc) => (
                            <div key={doc._id} style={{
                                padding: '18px',
                                border: '2px solid #E5E7EB',
                                borderRadius: '10px',
                                backgroundColor: '#FFFFFF',
                                position: 'relative'
                            }}>
                                {/* Verified Badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: '14px',
                                    right: '14px',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: '#2DD4BF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>

                                {/* Certificate Icon */}
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '14px'
                                }}>
                                    <span style={{ fontSize: '24pt' }}>🏆</span>
                                </div>

                                <h3 style={{
                                    fontFamily: 'Outfit, sans-serif',
                                    fontSize: '11pt',
                                    fontWeight: 500,
                                    color: '#1F2937',
                                    margin: '0 0 10px 0',
                                    lineHeight: '1.4',
                                    minHeight: '40px'
                                }}>
                                    {doc.originalName.replace(/\.[^/.]+$/, '')}
                                </h3>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                }}>
                                    <p style={{
                                        fontSize: '8pt',
                                        color: '#6B7280',
                                        margin: '0',
                                        fontFamily: 'JetBrains Mono, monospace'
                                    }}>
                                        Issued: {formatDate(doc.uploadDate)}
                                    </p>
                                    <p style={{
                                        fontSize: '8pt',
                                        color: '#6B7280',
                                        margin: '0',
                                        fontFamily: 'JetBrains Mono, monospace'
                                    }}>
                                        Size: {formatFileSize(doc.fileSize)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div style={{
                padding: '32px 60px',
                textAlign: 'center',
                borderTop: '2px solid #E5E7EB',
                marginTop: '40px'
            }}>
                <p style={{
                    fontSize: '10pt',
                    color: '#6B7280',
                    margin: '0',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    This portfolio is digitally verified and secured via EduVault
                </p>
                <p style={{
                    fontSize: '9pt',
                    color: '#9CA3AF',
                    margin: '8px 0 0 0',
                    fontFamily: 'JetBrains Mono, monospace'
                }}>
                    Generated on {new Date().toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </p>
            </div>
        </div>
    )
})

PortfolioPDF.displayName = 'PortfolioPDF'

export default PortfolioPDF
