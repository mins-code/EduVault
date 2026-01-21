import { useState, useEffect } from 'react';
import { Plus, ExternalLink, MapPin, DollarSign, Calendar, FileText, X, Trash2 } from 'lucide-react';
import Sidebar from './Sidebar';
import api from '../api';

export default function ApplicationTracker() {
    const [applications, setApplications] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [draggedItem, setDraggedItem] = useState(null);
    const [formData, setFormData] = useState({
        company: '',
        position: '',
        status: 'To Apply',
        salary: '',
        location: '',
        link: '',
        notes: '',
        appliedDate: ''
    });

    const columns = [
        { id: 'To Apply', gradient: 'from-slate-500/20 to-slate-600/20', borderColor: 'border-slate-500', textColor: 'text-slate-400' },
        { id: 'Applied', gradient: 'from-cyan-500/20 to-cyan-600/20', borderColor: 'border-cyan-500', textColor: 'text-cyan-400' },
        { id: 'Interviewing', gradient: 'from-violet-500/20 to-violet-600/20', borderColor: 'border-violet-500', textColor: 'text-violet-400' },
        { id: 'Offer', gradient: 'from-emerald-500/20 to-emerald-600/20', borderColor: 'border-emerald-500', textColor: 'text-emerald-400' },
        { id: 'Rejected', gradient: 'from-red-500/20 to-red-600/20', borderColor: 'border-red-500', textColor: 'text-red-400' }
    ];

    const getUserId = () => {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    userId = user.id || user._id || user.userId;
                    if (userId) localStorage.setItem('userId', userId);
                } catch (e) {
                    console.error('Failed to parse user data:', e);
                }
            }
        }
        return userId;
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        const userId = getUserId();
        if (!userId) {
            console.error('No userId found');
            setLoading(false);
            return;
        }
        try {
            const response = await api.get(`/api/applications?userId=${userId}`);
            if (response.data.success) {
                setApplications(response.data.applications);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = getUserId();
        if (!userId) {
            alert('Session expired. Please login again.');
            return;
        }
        try {
            const response = await api.post('/api/applications', {
                ...formData,
                userId,
                appliedDate: formData.appliedDate || new Date().toISOString()
            });
            if (response.data.success) {
                setApplications([response.data.application, ...applications]);
                setShowModal(false);
                setFormData({
                    company: '', position: '', status: 'To Apply',
                    salary: '', location: '', link: '', notes: '', appliedDate: ''
                });
            }
        } catch (error) {
            console.error('Error creating application:', error);
            alert(error.response?.data?.message || 'Failed to create application');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this application?')) return;
        const userId = getUserId();
        try {
            await api.delete(`/api/applications/${id}`, { data: { userId } });
            setApplications(applications.filter(app => app._id !== id));
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const handleDragStart = (e, app) => {
        setDraggedItem(app);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.status === newStatus) {
            setDraggedItem(null);
            return;
        }
        const userId = getUserId();
        try {
            const response = await api.patch(`/api/applications/${draggedItem._id}`, {
                userId, status: newStatus
            });
            if (response.data.success) {
                setApplications(applications.map(app =>
                    app._id === draggedItem._id ? { ...app, status: newStatus } : app
                ));
            }
        } catch (error) {
            console.error('Error updating:', error);
        }
        setDraggedItem(null);
    };

    const getApplicationsByStatus = (status) => applications.filter(app => app.status === status);

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center" style={{
                background: 'linear-gradient(180deg, #0A0F1F 0%, #0B1220 50%, #020617 100%)'
            }}>
                <p className="text-text-secondary text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Loading applications...
                </p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 ml-64 p-8" style={{
                background: 'linear-gradient(180deg, #0A0F1F 0%, #0B1220 50%, #020617 100%)'
            }}>
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-semibold text-text-primary mb-2" style={{
                            fontFamily: 'Outfit, sans-serif',
                            textShadow: '0 2px 20px rgba(56, 189, 248, 0.3)',
                            letterSpacing: '-0.02em'
                        }}>
                            Mission Control
                        </h1>
                        <p className="text-text-secondary" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {applications.length} application{applications.length !== 1 ? 's' : ''} tracked • Drag to update status
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-vault font-semibold transition-all duration-vault hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, #06B6D4, #0891B2)',
                            boxShadow: '0 0 24px rgba(6, 182, 212, 0.4)',
                            color: 'white',
                            fontFamily: 'Inter, sans-serif'
                        }}
                    >
                        <Plus className="w-5 h-5" />
                        New Application
                    </button>
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-5 gap-5">
                    {columns.map((column) => {
                        const columnApps = getApplicationsByStatus(column.id);

                        return (
                            <div
                                key={column.id}
                                className="flex flex-col"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, column.id)}
                            >
                                {/* Column Header */}
                                <div className={`mb-4 p-4 rounded-vault-lg border backdrop-blur-xl bg-gradient-to-br ${column.gradient}`} style={{
                                    borderColor: 'rgba(148, 163, 184, 0.2)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-text-primary" style={{
                                            fontFamily: 'Outfit, sans-serif',
                                            letterSpacing: '0.02em'
                                        }}>
                                            {column.id}
                                        </h3>
                                        <span className={`px-2.5 py-1 rounded-vault text-xs font-semibold ${column.textColor}`} style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(8px)'
                                        }}>
                                            {columnApps.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Cards Container */}
                                <div className="space-y-3 min-h-[300px]">
                                    {columnApps.map((app) => (
                                        <div
                                            key={app._id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, app)}
                                            className={`p-4 rounded-vault-lg border-l-4 ${column.borderColor} cursor-grab active:cursor-grabbing transition-all duration-vault hover:scale-[1.02] hover:shadow-vault-lg relative group`}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                backdropFilter: 'blur(12px)',
                                                borderRight: '1px solid rgba(148, 163, 184, 0.1)',
                                                borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                                                borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(56, 189, 248, 0.15)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(app._id); }}
                                                className="absolute top-2 right-2 p-1.5 rounded-vault bg-red-500/10 border border-red-500/30 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                                                title="Delete application"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>

                                            {/* Company */}
                                            <h4 className="text-base font-bold text-text-primary mb-1 pr-8" style={{
                                                fontFamily: 'Outfit, sans-serif',
                                                letterSpacing: '-0.01em'
                                            }}>
                                                {app.company}
                                            </h4>

                                            {/* Position */}
                                            <p className="text-sm text-text-secondary mb-3" style={{
                                                fontFamily: 'Inter, sans-serif'
                                            }}>
                                                {app.position}
                                            </p>

                                            {/* Metadata */}
                                            <div className="space-y-2">
                                                {app.salary && (
                                                    <div className="flex items-center gap-2 text-xs text-text-muted" style={{
                                                        fontFamily: 'JetBrains Mono, monospace'
                                                    }}>
                                                        <DollarSign className="w-3.5 h-3.5" />
                                                        {app.salary}
                                                    </div>
                                                )}
                                                {app.location && (
                                                    <div className="flex items-center gap-2 text-xs text-text-muted" style={{
                                                        fontFamily: 'JetBrains Mono, monospace'
                                                    }}>
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {app.location}
                                                    </div>
                                                )}
                                                {app.appliedDate && (
                                                    <div className="flex items-center gap-2 text-xs text-text-muted" style={{
                                                        fontFamily: 'JetBrains Mono, monospace'
                                                    }}>
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {formatDate(app.appliedDate)}
                                                    </div>
                                                )}
                                                {app.link && (
                                                    <a
                                                        href={app.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                                        style={{
                                                            fontFamily: 'JetBrains Mono, monospace'
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        View Job
                                                    </a>
                                                )}
                                            </div>

                                            {/* Notes */}
                                            {app.notes && (
                                                <div className="mt-3 pt-3 border-t border-slate-700/50">
                                                    <div className="flex items-start gap-2">
                                                        <FileText className="w-3.5 h-3.5 text-text-muted mt-0.5 flex-shrink-0" />
                                                        <p className="text-xs text-text-muted line-clamp-2" style={{
                                                            fontFamily: 'Inter, sans-serif'
                                                        }}>
                                                            {app.notes}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <div className="w-full max-w-2xl p-8 rounded-vault-lg border" style={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            borderColor: 'rgba(56, 189, 248, 0.3)',
                            boxShadow: '0 0 40px rgba(56, 189, 248, 0.2)'
                        }}>
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-text-primary" style={{
                                    fontFamily: 'Outfit, sans-serif',
                                    letterSpacing: '-0.02em'
                                }}>
                                    New Application
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 rounded-vault text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-secondary mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            Company Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 rounded-vault border bg-slate-800 border-slate-700 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                                            placeholder="e.g., Google"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-text-secondary mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            Position <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2.5 rounded-vault border bg-slate-800 border-slate-700 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                                            placeholder="e.g., Software Engineer"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-secondary mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-vault border bg-slate-800 border-slate-700 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        >
                                            <option value="To Apply">To Apply</option>
                                            <option value="Applied">Applied</option>
                                            <option value="Interviewing">Interviewing</option>
                                            <option value="Offer">Offer</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-text-secondary mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            Salary
                                        </label>
                                        <input
                                            type="text"
                                            name="salary"
                                            value={formData.salary}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-vault border bg-slate-800 border-slate-700 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                                            placeholder="e.g., 12 LPA"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-secondary mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-vault border bg-slate-800 border-slate-700 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                                            placeholder="e.g., Bangalore"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-text-secondary mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            Job Link
                                        </label>
                                        <input
                                            type="url"
                                            name="link"
                                            value={formData.link}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-vault border bg-slate-800 border-slate-700 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all"
                                            placeholder="https://..."
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-text-secondary mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-vault border bg-slate-800 border-slate-700 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none"
                                        placeholder="Add any notes or reminders..."
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-6 py-3 rounded-vault font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all"
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 rounded-vault font-semibold transition-all"
                                        style={{
                                            background: 'linear-gradient(135deg, #06B6D4, #0891B2)',
                                            boxShadow: '0 0 24px rgba(6, 182, 212, 0.4)',
                                            color: 'white',
                                            fontFamily: 'Inter, sans-serif'
                                        }}
                                    >
                                        Create Application
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
