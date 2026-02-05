import { forwardRef } from 'react'

const ResumePDF = forwardRef(({ user, documents, skills = [], codeProjects = [], badges = [] }, ref) => {
    // Filter documents by category AND isPublic status
    const academics = documents.filter(doc => doc.category === 'Academics')
    const internships = documents.filter(doc => doc.category === 'Internships' && doc.isPublic)
    const projects = documents.filter(doc => doc.category === 'Projects' && doc.isPublic)
    const certifications = documents.filter(doc => doc.category === 'Certifications' && doc.isPublic)

    // Helper to check if skills are objects with levels
    const isStructuredSkills = skills.length > 0 && typeof skills[0] === 'object'

    // Group skills by level (if structured)
    const expertSkills = isStructuredSkills ? skills.filter(s => s.level === 'Expert' || s.level === 'Advanced') : []
    const intermediateSkills = isStructuredSkills ? skills.filter(s => s.level === 'Intermediate') : []
    const beginnerSkills = isStructuredSkills ? skills.filter(s => s.level === 'Beginner') : []

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
                    {user.bio ? user.bio : (
                        `${user.degree} student at ${user.university} specializing in ${user.branch}. ` +
                        `Experienced in ${internships.length > 0 ? 'professional internships' : 'academic projects'} with ` +
                        `a strong foundation in technical skills and ${certifications.length} professional certifications. ` +
                        `Expected graduation: ${user.graduationYear}.`
                    )}
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

                {/* Skills Section (Dynamic) */}
                {skills.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                        <p style={{
                            fontSize: '10pt',
                            fontWeight: 600,
                            color: '#1F2937',
                            margin: '0 0 4px 0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px'
                        }}>
                            Technical Skills
                        </p>
                        <div style={{ fontSize: '10pt', color: '#4B5563' }}>
                            {isStructuredSkills ? (
                                <>
                                    {expertSkills.length > 0 && (
                                        <div style={{ marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 600 }}>Expert: </span>
                                            {expertSkills.map(s => s.name).join(', ')}
                                        </div>
                                    )}
                                    {intermediateSkills.length > 0 && (
                                        <div style={{ marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 600 }}>Intermediate: </span>
                                            {intermediateSkills.map(s => s.name).join(', ')}
                                        </div>
                                    )}
                                    {beginnerSkills.length > 0 && (
                                        <div>
                                            <span style={{ fontWeight: 600 }}>Familiar: </span>
                                            {beginnerSkills.map(s => s.name).join(', ')}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {skills.map((skill, index) => (
                                        <span key={index} style={{
                                            fontSize: '10pt',
                                            color: '#0369A1',
                                            padding: '2px 10px',
                                            backgroundColor: '#E0F2FE',
                                            borderRadius: '4px',
                                            border: '1px solid #BAE6FD',
                                            fontWeight: 500
                                        }}>
                                            {typeof skill === 'string' ? skill : skill.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
                                    {doc.derivedTitle || doc.originalName.replace(/\.[^/.]+$/, '')}
                                </h3>
                                <span style={{
                                    fontSize: '10pt',
                                    color: '#6B7280',
                                    fontFamily: 'JetBrains Mono, monospace'
                                }}>
                                    {formatDate(doc.uploadDate)}
                                </span>
                            </div>
                            {doc.derivedDescription ? (
                                <p style={{
                                    margin: '6px 0 0 0',
                                    fontSize: '10pt',
                                    color: '#4B5563',
                                    lineHeight: '1.6',
                                    fontFamily: 'Inter, sans-serif'
                                }}>
                                    {doc.derivedDescription}
                                </p>
                            ) : (
                                <p style={{ margin: '4px 0 0 0', fontSize: '10pt', color: '#6B7280', fontStyle: 'italic' }}>
                                    Details available in verified portfolio
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Badges & Achievements (New) */}
            {badges.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        borderBottom: '1.5px solid #0D9488',
                        paddingBottom: '4px',
                        marginBottom: '12px'
                    }}>
                        <h2 style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '14pt',
                            fontWeight: 600,
                            color: '#1E3A8A',
                            margin: '0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Badges & Achievements
                        </h2>
                        <span style={{ fontSize: '10pt', color: '#6B7280', fontWeight: 500 }}>
                            {badges.length} {badges.length === 1 ? 'Badge' : 'Badges'} Earned
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {badges.map((badge, index) => {
                            // Check if challengeId is populated (object) or just an ID (string)
                            // If populated, use its title or language
                            const challenge = typeof badge.challengeId === 'object' ? badge.challengeId : null;
                            const title = challenge
                                ? `${challenge.language ? challenge.language.charAt(0).toUpperCase() + challenge.language.slice(1) : ''} Challenge Completed`
                                : badge.challengeId ? 'Challenge Completed' : 'Achievement Unlocked';

                            return (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 12px',
                                    backgroundColor: '#FEF3C7',
                                    borderRadius: '6px',
                                    border: '1px solid #FCD34D'
                                }}>
                                    <span style={{ fontSize: '12pt' }}>🏆</span>
                                    <div>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '10pt',
                                            fontWeight: 600,
                                            color: '#92400E'
                                        }}>
                                            {title}
                                        </span>
                                        <span style={{
                                            fontSize: '8pt',
                                            color: '#B45309'
                                        }}>
                                            {formatDate(badge.awardedAt)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Certifications - Renamed from Skills & Certifications */}
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
                        Certifications
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

            {/* Open Source / Code Projects */}
            {codeProjects.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '14pt',
                        fontWeight: 600,
                        color: '#1E3A8A', // Matches other headers
                        margin: '0 0 12px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1.5px solid #0D9488', // Matches other accents
                        paddingBottom: '4px'
                    }}>
                        Open Source / Code
                    </h2>
                    {codeProjects.map((project, index) => (
                        <div key={project._id || index} style={{ marginBottom: index < codeProjects.length - 1 ? '16px' : '0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <h3 style={{
                                    fontFamily: 'Outfit, sans-serif',
                                    fontSize: '12pt',
                                    fontWeight: 500,
                                    color: '#1F2937', // Matches other titles
                                    margin: '0'
                                }}>
                                    {project.title}
                                </h3>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '9pt' }}>
                                    {project.githubLink && (
                                        <a href={project.githubLink} style={{ color: '#0D9488', textDecoration: 'none' }}>
                                            View Code
                                        </a>
                                    )}
                                </div>
                            </div>
                            {project.description && (
                                <p style={{
                                    margin: '4px 0 6px 0',
                                    fontSize: '10pt',
                                    color: '#4B5563',
                                    lineHeight: '1.5'
                                }}>
                                    {project.description}
                                </p>
                            )}
                            {project.tags && project.tags.length > 0 && (
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {project.tags.map(tag => (
                                        <span key={tag} style={{
                                            fontSize: '8pt',
                                            padding: '2px 8px',
                                            backgroundColor: '#CFFAFE',
                                            color: '#155E75',
                                            borderRadius: '999px',
                                            fontFamily: 'JetBrains Mono, monospace'
                                        }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Document Projects */}
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
                        Document Projects
                    </h2>
                    {projects.slice(0, 3).map((doc, index) => (
                        <div key={doc._id} style={{
                            marginBottom: index < Math.min(projects.length, 3) - 1 ? '16px' : '0',
                            pageBreakInside: 'avoid',
                            breakInside: 'avoid',
                            padding: '12px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            backgroundColor: '#F9FAFB'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <h3 style={{
                                    fontFamily: 'Outfit, sans-serif',
                                    fontSize: '11pt',
                                    fontWeight: 600,
                                    color: '#1F2937',
                                    margin: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{
                                        color: '#0D9488',
                                        fontSize: '10pt',
                                        opacity: 0.8,
                                        fontFamily: 'JetBrains Mono, monospace'
                                    }}>
                                        {(index + 1).toString().padStart(2, '0')}.
                                    </span>
                                    {doc.derivedTitle || doc.originalName.replace(/\.[^/.]+$/, '')}
                                </h3>
                                <span style={{
                                    fontSize: '9pt',
                                    color: '#6B7280',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    backgroundColor: '#FFFFFF',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #E5E7EB'
                                }}>
                                    {formatDate(doc.uploadDate)}
                                </span>
                            </div>
                            <p style={{
                                margin: '8px 0 0 0',
                                fontSize: '10pt',
                                color: doc.derivedDescription ? '#4B5563' : '#6B7280',
                                lineHeight: '1.5',
                                fontFamily: doc.derivedDescription ? 'Inter, sans-serif' : 'inherit',
                                paddingLeft: '32px' // Indent description to align with title text (skipping number)
                            }}>
                                {doc.derivedDescription || 'Project documentation and details available in verified digital portfolio.'}
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
