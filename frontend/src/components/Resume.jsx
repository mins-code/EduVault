import { forwardRef } from 'react'

const Resume = forwardRef(({ user, documents }, ref) => {
    // Filter documents by category
    const internships = documents.filter(doc => doc.category === 'Internships')
    const projects = documents.filter(doc => doc.category === 'Projects')
    const certifications = documents.filter(doc => doc.category === 'Certifications')
    const academics = documents.filter(doc => doc.category === 'Academics')

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        })
    }

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
            <div style={{ marginBottom: '32px', textAlign: 'center', borderBottom: '2px solid #1E3A8A', paddingBottom: '16px' }}>
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
                <p style={{
                    margin: '4px 0',
                    fontSize: '10pt',
                    color: '#4B5563'
                }}>
                    {user.email} • Portfolio: eduvault.com/portfolio/{user.username}
                </p>
            </div>

            {/* Education Section */}
            <div style={{ marginBottom: '28px' }}>
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
                <div style={{ marginBottom: '8px' }}>
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
                        <span style={{ fontSize: '10pt', color: '#6B7280' }}>
                            Expected {user.graduationYear}
                        </span>
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '11pt', color: '#4B5563' }}>
                        {user.degree} in {user.branch}
                    </p>
                </div>
            </div>

            {/* Experience Section */}
            {internships.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
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
                    {internships.map((doc, index) => (
                        <div key={doc._id} style={{ marginBottom: index < internships.length - 1 ? '16px' : '0' }}>
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
                                <span style={{ fontSize: '10pt', color: '#6B7280' }}>
                                    {formatDate(doc.uploadDate)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Projects Section */}
            {projects.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
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
                    {projects.map((doc, index) => (
                        <div key={doc._id} style={{ marginBottom: index < projects.length - 1 ? '16px' : '0' }}>
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
                                <span style={{ fontSize: '10pt', color: '#6B7280' }}>
                                    {formatDate(doc.uploadDate)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Certifications Section */}
            {certifications.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
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
                        Certifications
                    </h2>
                    {certifications.map((doc, index) => (
                        <div key={doc._id} style={{ marginBottom: index < certifications.length - 1 ? '8px' : '0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '11pt', color: '#1F2937' }}>
                                    • {doc.originalName.replace(/\.[^/.]+$/, '')}
                                </span>
                                <span style={{ fontSize: '10pt', color: '#6B7280' }}>
                                    {formatDate(doc.uploadDate)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Academic Achievements */}
            {academics.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
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
                        Academic Achievements
                    </h2>
                    {academics.map((doc, index) => (
                        <div key={doc._id} style={{ marginBottom: index < academics.length - 1 ? '8px' : '0' }}>
                            <span style={{ fontSize: '11pt', color: '#1F2937' }}>
                                • {doc.originalName.replace(/\.[^/.]+$/, '')}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div style={{
                marginTop: '48px',
                paddingTop: '16px',
                borderTop: '1px solid #E5E7EB',
                textAlign: 'center',
                fontSize: '9pt',
                color: '#9CA3AF'
            }}>
                Generated via EduVault • Secure Document Management
            </div>
        </div>
    )
})

Resume.displayName = 'Resume'

export default Resume
