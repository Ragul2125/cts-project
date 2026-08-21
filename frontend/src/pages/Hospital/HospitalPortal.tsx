import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Activity,
  PlusCircle,
  BarChart2,
  HelpCircle,
  LogOut,
  Bell,
  Settings,
  Calendar,
  Download,
  Filter,
  MoreVertical,
  ArrowLeft,
  Printer,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HeartPulse,
  Bed,
  Timer,
  UserPlus,
  FileText,
  CalendarDays,
  ChevronRight,
  Shield,
  Search,
  Plus,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  CareRequest,
  CareAction
} from '../../data/hospitalMockData';
import { apiService } from '../../services/api';
import styles from './HospitalPortal.module.css';

interface HospitalPortalProps {
  session?: any;
  onLogout: () => void;
}

export default function HospitalPortal({ session, onLogout }: HospitalPortalProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'care-requests' | 'patients' | 'ed-utilization' | 'care-actions' | 'reports'>('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<CareRequest | null>(null);
  const [queueSubTab, setQueueSubTab] = useState<'triage' | 'pending' | 'escalated' | 'completed'>('triage');
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const loadReport = async (reportId: string) => {
    setSelectedReport(reportId);
    setReportData(null);
    try {
      const data = await apiService.getHOSReport(reportId);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    }
  };
  // Live Database State
  const [dbRequests, setDbRequests] = useState<CareRequest[]>([]);
  const [dbActions, setDbActions] = useState<CareAction[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Request Form State
  const [newPatientName, setNewPatientName] = useState('');
  const [newMrn, setNewMrn] = useState('');
  const [newType, setNewType] = useState('Cardiology Consult');
  const [newPriority, setNewPriority] = useState<'Urgent' | 'Standard' | 'Low'>('Standard');
  const [newSummary, setNewSummary] = useState('');

  // Form state for Request Detail Determination
  const [determination, setDetermination] = useState('');
  const [authDuration, setAuthDuration] = useState('14');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [notifyProvider, setNotifyProvider] = useState(false);

  const fetchLiveData = async () => {
    try {
      setLoading(true);
      const [dash, reqs, acts] = await Promise.all([
        apiService.getHOSDashboard().catch(() => null),
        apiService.getHOSCareRequests({ search: searchQuery }).catch(() => []),
        apiService.getHOSCareActions().catch(() => [])
      ]);
      if (dash) setDashboardData(dash);
      if (reqs) setDbRequests(reqs);
      if (acts) setDbActions(acts);
    } catch (err) {
      console.warn('Failed to load HOS live data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, [searchQuery]);

  const handleCreateNewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newMrn.trim()) return;

    try {
      await apiService.createHOSCareRequest({
        patient_name: newPatientName,
        mrn: newMrn,
        type: newType,
        priority: newPriority,
        summary: newSummary
      });
      setIsNewRequestOpen(false);
      setNewPatientName('');
      setNewMrn('');
      setNewSummary('');
      fetchLiveData();
    } catch (err) {
      console.error('Failed to create care request:', err);
    }
  };

  const handleSaveDetermination = async () => {
    if (!selectedRequest || !determination) return;
    try {
      await apiService.updateHOSDetermination(selectedRequest.id, {
        status: determination,
        auth_duration_days: parseInt(authDuration) || 14,
        clinical_notes: clinicalNotes
      });
      setDetermination('');
      setClinicalNotes('');
      fetchLiveData();
      setSelectedRequest(prev => prev ? { ...prev, status: determination as any } : null);
    } catch (err) {
      console.error('Failed to update determination:', err);
    }
  };

  return (
    <div className={styles.container}>
      {/* ── Left Dark Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.brandHeader}>
          <div className={styles.brandIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div>
            <div className={styles.brandName}>CarePath AI</div>
            <div className={styles.brandSub}>CLINICAL COMMAND</div>
          </div>
        </div>

        <div className={styles.newRequestBtnWrapper}>
          <button className={styles.newRequestBtn} onClick={() => setIsNewRequestOpen(true)}>
            <Plus size={16} strokeWidth={2.5} />
            <span>New Care Request</span>
          </button>
        </div>

        <nav className={styles.navSection}>
          <button
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`}
            onClick={() => {
              setActiveTab('dashboard');
              setSelectedRequest(null);
            }}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'care-requests' ? styles.navItemActive : ''}`}
            onClick={() => {
              setActiveTab('care-requests');
              setSelectedRequest(null);
            }}
          >
            <ClipboardList size={17} />
            <span>Care Requests</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'patients' ? styles.navItemActive : ''}`}
            onClick={() => {
              setActiveTab('patients');
              setSelectedRequest(null);
            }}
          >
            <Users size={17} />
            <span>Patients</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'ed-utilization' ? styles.navItemActive : ''}`}
            onClick={() => {
              setActiveTab('ed-utilization');
              setSelectedRequest(null);
            }}
          >
            <Activity size={17} />
            <span>ED Utilization</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'care-actions' ? styles.navItemActive : ''}`}
            onClick={() => {
              setActiveTab('care-actions');
              setSelectedRequest(null);
            }}
          >
            <PlusCircle size={17} />
            <span>Care Actions</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'reports' ? styles.navItemActive : ''}`}
            onClick={() => {
              setActiveTab('reports');
              setSelectedRequest(null);
            }}
          >
            <BarChart2 size={17} />
            <span>Reports</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.footerBtn} onClick={() => alert('CarePath Hospital Support & Clinical Desk')}>
            <HelpCircle size={15} />
            <span>Support</span>
          </button>
          <button className={styles.footerBtn} onClick={onLogout}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Layout Area ── */}
      <div className={styles.mainWrapper}>
        {/* Top Header Bar */}
        <header className={styles.topBar}>
          {activeTab === 'care-requests' || activeTab === 'ed-utilization' || activeTab === 'care-actions' ? (
            <div className={styles.searchBarHeader}>
              <Search size={14} color="#94A3B8" />
              <input
                type="text"
                placeholder={
                  activeTab === 'ed-utilization' 
                    ? 'Search patients, claims, analytics...' 
                    : activeTab === 'care-actions'
                    ? 'Search patients, MRNs...'
                    : 'Search patients, requests, or IDs...'
                }
                className={styles.searchBarInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          ) : (
            <div className={styles.breadcrumb}>
              <span>CarePath AI &gt; </span>
              <span className={styles.breadcrumbActive}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
              </span>
            </div>
          )}

          <div className={styles.topBarActions}>
            <button className={styles.iconBtn} aria-label="Notifications">
              <Bell size={16} />
              <span className={styles.notifDot} />
            </button>
            <button className={styles.iconBtn} aria-label="Help">
              <HelpCircle size={16} />
            </button>
            <button className={styles.iconBtn} aria-label="Settings">
              <Settings size={16} />
            </button>
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&auto=format&fit=crop&q=80"
              alt="User"
              className={styles.userImg}
            />
          </div>
        </header>

        {/* ── Main Dynamic View ── */}
        <main className={styles.contentView}>
          {/* ========================================================
              SCREEN 1: OVERVIEW / DASHBOARD
             ======================================================== */}
          {activeTab === 'dashboard' && (
            <>
              <div className={styles.pageHeader}>
                <div className={styles.pageTitleGroup}>
                  <h1 className={styles.pageTitle}>Overview</h1>
                  <p className={styles.pageSub}>Live updates across your clinical operations.</p>
                </div>
                <div className={styles.headerActions}>
                  <button className={styles.btnSecondary}><Calendar size={14} /> Today</button>
                  <button className={styles.btnPrimary}><Download size={14} /> Export</button>
                </div>
              </div>

              {/* 4 Stats Cards */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span className={styles.statLabel}>Active Care Requests</span>
                    <div className={styles.statIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}><Activity size={15} /></div>
                  </div>
                  <div className={styles.statValue}>{dashboardData?.kpis?.total_care_requests || 0}</div>
                  <span className={`${styles.statPill} ${styles.statPillGreen}`}>Live Active</span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span className={styles.statLabel}>Pending Reviews</span>
                    <div className={styles.statIcon} style={{ background: '#FEF3C7', color: '#D97706' }}><ClipboardList size={15} /></div>
                  </div>
                  <div className={styles.statValue}>{dashboardData?.kpis?.pending_triage || 0}</div>
                  {dashboardData?.kpis?.pending_triage > 0 ? (
                    <span className={`${styles.statPill} ${styles.statPillCoral}`}>Needs attention</span>
                  ) : (
                    <span className={`${styles.statPill} ${styles.statPillGreen}`}>All caught up</span>
                  )}
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span className={styles.statLabel}>High Priority Actions</span>
                    <div className={styles.statIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}><AlertTriangle size={15} /></div>
                  </div>
                  <div className={styles.statValue}>{dashboardData?.kpis?.high_priority_actions || 0}</div>
                  <span className={`${styles.statPill} ${styles.statPillCoral}`}>Action Required</span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span className={styles.statLabel}>Avg Time to Triage</span>
                    <div className={styles.statIcon} style={{ background: '#F5F3FF', color: '#7C3AED' }}><Timer size={15} /></div>
                  </div>
                  <div className={styles.statValue}>{dashboardData?.kpis?.avg_triage_time || 0}<span style={{ fontSize: '1.25rem', fontWeight: 600 }}>m</span></div>
                  <span className={styles.statSubtext}>Stable average</span>
                </div>
              </div>

              {/* Middle Row: Request Volume & Quick Actions */}
              <div className={styles.splitGrid}>
                {/* Request Volume Chart */}
                <div className={styles.cardBox}>
                  <div className={styles.cardHeaderRow}>
                    <h2 className={styles.cardTitle}>Request Volume</h2>
                    <select className={styles.btnSecondary} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                      <option>Last 7 Days ▾</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>
                  <div style={{ height: 220, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData?.request_volume || []}>
                        <defs>
                          <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                        <YAxis stroke="#94A3B8" fontSize={12} />
                        <Tooltip />
                        <Area type="monotone" dataKey="volume" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#volGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.cardBox}>
                  <div className={styles.cardHeaderRow}>
                    <h2 className={styles.cardTitle}>Quick Actions</h2>
                  </div>
                  <div className={styles.quickActionsList}>
                    <div className={styles.quickActionItem} onClick={() => setIsNewRequestOpen(true)}>
                      <div className={styles.quickActionIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}>
                        <UserPlus size={18} />
                      </div>
                      <div>
                        <div className={styles.quickActionTitle}>Admit Patient</div>
                        <div className={styles.quickActionSub}>Start admission workflow</div>
                      </div>
                    </div>

                    <div className={styles.quickActionItem} onClick={() => {
                      setActiveTab('care-requests');
                      if (dbRequests.length > 0) setSelectedRequest(dbRequests[0]);
                    }}>
                      <div className={styles.quickActionIcon} style={{ background: '#ECFDF5', color: '#059669' }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className={styles.quickActionTitle}>Review Discharge</div>
                        <div className={styles.quickActionSub}>3 pending reviews</div>
                      </div>
                    </div>

                    <div className={styles.quickActionItem} onClick={() => alert('Opening Transfer Dispatch...')}>
                      <div className={styles.quickActionIcon} style={{ background: '#FFF7ED', color: '#EA580C' }}>
                        <CalendarDays size={18} />
                      </div>
                      <div>
                        <div className={styles.quickActionTitle}>Schedule Transfer</div>
                        <div className={styles.quickActionSub}>Inter-facility transport</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Recent Care Requests Table */}
              <div className={styles.tableContainer}>
                <div className={styles.tableHeaderBar}>
                  <h2 className={styles.cardTitle}>Recent Care Requests</h2>
                  <span className={styles.viewAllLink} onClick={() => setActiveTab('care-requests')}>View All</span>
                </div>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Patient ID</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbRequests.slice(0, 5).map(req => (
                      <tr key={req.id} style={{ cursor: 'pointer' }} onClick={() => {
                        setSelectedRequest(req);
                        setActiveTab('care-requests');
                      }}>
                        <td style={{ fontWeight: 700, color: '#1E293B' }}>{req.patientId || (req as any).patient_id || 'Unknown'}</td>
                        <td style={{ fontWeight: 600 }}>{req.type}</td>
                        <td>
                          <span className={
                            req.status === 'Pending' || (req.status as any) === 'Triage' ? styles.badgePending :
                            req.status === 'Approved' || (req.status as any) === 'Discharged' ? styles.badgeApproved :
                            req.status === 'Urgent' || (req.status as any) === 'Escalated' ? styles.badgeUrgent : styles.badgeCompleted
                          }>
                            ● {req.status || 'Pending'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: '#64748B' }}>{req.time || 'Recent'}</td>
                        <td><MoreVertical size={15} color="#94A3B8" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ========================================================
              SCREEN 2 & 3: CARE REQUESTS QUEUE & DETAIL
             ======================================================== */}
          {activeTab === 'care-requests' && (
            <>
              {selectedRequest ? (
                /* SCREEN 2: Request Detail & AI Assessment */
                <>
                  <div className={styles.pageHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <button className={styles.btnSecondary} onClick={() => setSelectedRequest(null)} style={{ padding: '6px 12px' }}>
                        <ArrowLeft size={14} />
                      </button>
                      <h1 className={styles.pageTitle} style={{ fontSize: '1.25rem' }}>
                        Care Request #{selectedRequest.id}
                      </h1>
                      <span className={styles.badgePending} style={{ textTransform: 'uppercase', fontSize: '0.6875rem' }}>
                        PENDING REVIEW
                      </span>
                    </div>

                    <div className={styles.headerActions}>
                      <button className={styles.iconBtn} aria-label="Print" onClick={() => window.print()}><Printer size={16} /></button>
                      <button className={styles.iconBtn} aria-label="Options"><MoreVertical size={16} /></button>
                    </div>
                  </div>

                  <div className={styles.splitGrid} style={{ gridTemplateColumns: '1fr 1.6fr', alignItems: 'start' }}>
                    {/* Left: Patient Info & Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Patient Summary Card */}
                      <div className={styles.cardBox}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <img
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                            alt="Patient"
                            style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#0F172A' }}>{selectedRequest.patientName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{selectedRequest.dob}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>MRN: {selectedRequest.mrn}</div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8' }}>PRIMARY CARE</div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {selectedRequest.primaryCare || 'Dr. Sarah Jenkins'}
                            </div>
                          </div>
                          <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8' }}>INSURANCE</div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {selectedRequest.insurance || 'Medicare Adv.'}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>ACTIVE CONDITIONS</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {(selectedRequest.conditions || ['CHF', 'Type 2 Diabetes', 'Hypertension']).map(c => (
                              <span key={c} style={{ padding: '2px 8px', background: '#F1F5F9', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recent Utilization Timeline */}
                      <div className={styles.cardBox}>
                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={15} color="#64748B" /> Recent Utilization
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
                          {(selectedRequest.recentUtilization || [
                            { type: 'ED Visit - Shortness of breath', date: 'Oct 12, 2026 • Mercy General', color: '#EF4444' },
                            { type: 'PCP Follow-up', date: 'Oct 05, 2026 • Dr. Jenkins', color: '#8B5CF6' },
                            { type: 'Home Health Assessment', date: 'Sep 28, 2026 • VNA Care', color: '#10B981' }
                          ]).map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, marginTop: 4, flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>{item.type}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.date} {(item as any).location ? `• ${(item as any).location}` : ''}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: AI Clinical Assessment & Determination Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* AI Clinical Assessment Card */}
                      <div className={styles.cardBox} style={{ background: '#F8FAFF', borderColor: '#DBEAFE' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#2563EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={16} />
                          </div>
                          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E3A8A' }}>AI Clinical Assessment</h2>
                        </div>

                        <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.55 }}>
                          Request for <strong>Skilled Nursing Facility (SNF)</strong> placement. Patient exhibits increasing difficulty with ADLs and recent exacerbation of CHF resulting in an ED visit. AI analysis indicates a high probability of readmission without structured rehabilitation.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 14, paddingTop: 10, borderTop: '1px solid #E2E8F0' }}>
                          <div>
                            <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>GUIDELINE MATCH</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginTop: 2 }}>92%</div>
                            <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, margin: '4px 0', overflow: 'hidden' }}>
                              <div style={{ width: '92%', height: '100%', background: '#059669' }} />
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Meets MCG criteria for SNF level of care.</div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>READMISSION RISK</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#DC2626', marginTop: 2 }}>High</div>
                            <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, margin: '4px 0', overflow: 'hidden' }}>
                              <div style={{ width: '85%', height: '100%', background: '#DC2626' }} />
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Based on recent ED visit and comorbidities.</div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>SUGGESTED ACTION</div>
                            <div style={{ marginTop: 6 }}>
                              <span style={{ padding: '6px 12px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 6, color: '#059669', fontWeight: 700, fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <CheckCircle2 size={14} /> Approve Request
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Clinical Review & Determination Form */}
                      <div className={styles.cardBox}>
                        <h2 className={styles.cardTitle}>Clinical Review &amp; Determination</h2>

                        <div>
                          <label style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: 6 }}>
                            CLINICAL NOTES
                          </label>
                          <textarea
                            placeholder="Enter clinical rationale for determination..."
                            rows={4}
                            value={clinicalNotes}
                            onChange={(e) => setClinicalNotes(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid #CBD5E1',
                              borderRadius: 6,
                              fontSize: '0.8125rem',
                              fontFamily: 'inherit',
                              outline: 'none',
                              resize: 'vertical'
                            }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                          <div>
                            <label style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: 6 }}>
                              DETERMINATION
                            </label>
                            <select
                              value={determination}
                              onChange={(e) => setDetermination(e.target.value)}
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.8125rem', outline: 'none' }}
                            >
                              <option value="">Select Outcome... ▾</option>
                              <option value="Approved">Approved</option>
                              <option value="Denied">Denied</option>
                              <option value="Peer-to-Peer Required">Peer-to-Peer Required</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: 6 }}>
                              AUTHORIZED DURATION
                            </label>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <input
                                type="text"
                                value={authDuration}
                                onChange={(e) => setAuthDuration(e.target.value)}
                                placeholder="e.g. 14"
                                style={{ width: '60%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.8125rem', outline: 'none' }}
                              />
                              <select style={{ width: '40%', padding: '8px 8px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.8125rem', outline: 'none' }}>
                                <option>Days ▾</option>
                                <option>Weeks</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: '#475569', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={notifyProvider}
                            onChange={(e) => setNotifyProvider(e.target.checked)}
                          />
                          <span>Send automated notification to requesting provider</span>
                        </label>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14, marginTop: 10 }}>
                          <button className={styles.btnSecondary} onClick={() => alert('Draft saved successfully.')}>
                            Save Draft
                          </button>
                          <button className={styles.btnPrimary} onClick={() => {
                            alert('Determination submitted successfully.');
                            setSelectedRequest(null);
                          }}>
                            Submit Determination
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* SCREEN 3: Modern Care Requests Queue */
                <>
                  <div className={styles.pageHeader}>
                    <div className={styles.pageTitleGroup}>
                      <h1 className={styles.pageTitle}>Care Requests</h1>
                      <p className={styles.pageSub}>Manage and triage incoming clinical requests.</p>
                    </div>
                    <div className={styles.headerActions}>
                      <button className={styles.btnSecondary}><Filter size={14} /> Filter</button>
                      <button className={styles.btnPrimary}><Download size={14} /> Export List</button>
                    </div>
                  </div>

                  <div className={styles.tableContainer}>
                    <div className={styles.tableHeaderBar}>
                      <div className={styles.tableNavTabs}>
                        <button
                          className={`${styles.tableNavTab} ${queueSubTab === 'triage' ? styles.tableNavTabActive : ''}`}
                          onClick={() => setQueueSubTab('triage')}
                        >
                          Active Triage <span className={styles.tableNavBadge}>12</span>
                        </button>
                        <button
                          className={`${styles.tableNavTab} ${queueSubTab === 'pending' ? styles.tableNavTabActive : ''}`}
                          onClick={() => setQueueSubTab('pending')}
                        >
                          Pending Review
                        </button>
                        <button
                          className={`${styles.tableNavTab} ${queueSubTab === 'escalated' ? styles.tableNavTabActive : ''}`}
                          onClick={() => setQueueSubTab('escalated')}
                        >
                          Escalated
                        </button>
                        <button
                          className={`${styles.tableNavTab} ${queueSubTab === 'completed' ? styles.tableNavTabActive : ''}`}
                          onClick={() => setQueueSubTab('completed')}
                        >
                          Completed
                        </button>
                      </div>
                    </div>

                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Patient / ID</th>
                          <th>Request Type</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbRequests.map((req, idx) => {
                          const pName = req.patientName || (req as any).patient_name || 'Unknown Patient';
                          const initials = pName.split(' ').map((n: string) => n[0]).join('').substring(0, 2);
                          return (
                          <tr key={req.id || idx} style={{ cursor: 'pointer' }} onClick={() => {
                            setSelectedRequest(req);
                          }}>
                            <td>
                              <div className={styles.patientCell}>
                                <div className={styles.patientInitialsCircle}>{initials}</div>
                                <div>
                                  <div className={styles.patientName}>{pName}</div>
                                  <div className={styles.patientMRN}>MRN: {req.mrn || (req as any).mrn}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: '#0F172A' }}>{req.type || (req as any).type}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{req.time || 'Recent'}</div>
                            </td>
                            <td>
                              <span className={req.priority === 'Urgent' ? styles.badgeUrgent : req.priority === 'Standard' ? styles.badgePending : styles.badgeApproved}>
                                {req.priority === 'Urgent' ? '! Urgent' : req.priority === 'Standard' ? '⏱ Standard' : '✓ Low'}
                              </span>
                            </td>
                            <td>
                              <span className={styles.badgeSoftBlue}>{req.status || 'Pending'}</span>
                            </td>
                            <td><MoreVertical size={16} color="#94A3B8" /></td>
                          </tr>
                        )})}
                      </tbody>
                    </table>

                    <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748B' }}>
                      <span>Showing 1 to 3 of 12 requests</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className={styles.btnSecondary} style={{ padding: '2px 8px' }}>&lt;</button>
                        <button className={styles.btnSecondary} style={{ padding: '2px 8px' }}>&gt;</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ========================================================
              SCREEN 4: REPORTS
             ======================================================== */}
          {activeTab === 'reports' && (
            <>
              {selectedReport ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => setSelectedReport(null)} className={styles.btnSecondary} style={{ padding: '8px' }}>
                      <ArrowLeft size={18} />
                    </button>
                    <div>
                      <h1 className={styles.pageTitle} style={{ margin: 0 }}>{reportData?.title || 'Loading Report...'}</h1>
                      <div className={styles.pageSub} style={{ marginTop: 4 }}>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                       <button className={styles.btnSecondary} onClick={() => alert('CSV Export initiated.')}><Download size={15} /> Export CSV</button>
                       <button className={styles.btnPrimary} onClick={() => alert('PDF Export initiated.')}><FileText size={15} /> Export PDF</button>
                    </div>
                  </div>
                  
                  {reportData ? (
                    <>
                      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '16px 20px', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0369A1', fontWeight: 700, marginBottom: 8 }}>
                           <Sparkles size={16} /> AI Insights
                        </div>
                        <p style={{ color: '#0C4A6E', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
                          {reportData.summary}
                        </p>
                      </div>
                      
                      <div className={styles.chartCard}>
                        <h2 className={styles.cardTitle}>Trend Analysis</h2>
                        <div className={styles.chartContainer}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.chartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                              <YAxis stroke="#94A3B8" fontSize={12} />
                              <Tooltip />
                              <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className={styles.tableContainer}>
                        <table className={styles.dataTable}>
                          <thead>
                            <tr>
                              {reportData.tableData.length > 0 && Object.keys(reportData.tableData[0]).filter(k => k !== 'id').map(k => (
                                <th key={k} style={{ textTransform: 'capitalize' }}>{k.replace('_', ' ')}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.tableData.map((row: any) => (
                              <tr key={row.id}>
                                {Object.entries(row).filter(([k]) => k !== 'id').map(([k, v]: [string, any]) => (
                                  <td key={k}>{v}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: '#94A3B8' }}>
                      <Activity size={24} className="animate-pulse" />
                      <span style={{ marginLeft: 12 }}>Crunching the numbers...</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className={styles.pageHeader}>
                    <div className={styles.pageTitleGroup}>
                      <h1 className={styles.pageTitle}>Reports</h1>
                      <p className={styles.pageSub}>
                        Access comprehensive clinical, operational, and financial analytics. Reports are updated in real-time based on active care requests and historical data.
                      </p>
                    </div>
                  </div>

              <div className={styles.reportsGrid}>
                {/* Clinical Outcomes Card */}
                <div className={styles.reportCard}>
                  <div className={styles.reportHeader}>
                    <div className={styles.reportIconBox} style={{ background: '#ECFDF5', color: '#059669' }}>
                      <Activity size={18} />
                    </div>
                    <div>
                      <h2 className={styles.reportTitle}>Clinical Outcomes</h2>
                      <div className={styles.reportSub}>Patient health metrics</div>
                    </div>
                  </div>
                  <div className={styles.reportLinkList}>
                    <div className={styles.reportLinkItem} onClick={() => loadReport('readmission-rates')}>
                      <span>Readmission Rates</span>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                    <div className={styles.reportLinkItem} onClick={() => loadReport('length-of-stay-variance')}>
                      <span>Length of Stay Variance</span>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                    <div className={styles.reportLinkItem} onClick={() => loadReport('mortality-metrics')}>
                      <span>Mortality Metrics</span>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                  </div>
                </div>

                {/* ED Utilization Card */}
                <div className={styles.reportCard}>
                  <div className={styles.reportHeader}>
                    <div className={styles.reportIconBox} style={{ background: '#FFFBEB', color: '#D97706' }}>
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h2 className={styles.reportTitle}>ED Utilization</h2>
                      <div className={styles.reportSub}>Emergency flow analytics</div>
                    </div>
                  </div>
                  <div className={styles.reportLinkList}>
                    <div className={styles.reportLinkItem} onClick={() => loadReport('triage-wait-times')}>
                      <span>Triage Wait Times</span>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                    <div className={styles.reportLinkItem} onClick={() => loadReport('boarding-duration')}>
                      <span>Boarding Duration</span>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                    <div className={styles.reportLinkItem} onClick={() => loadReport('left-without-being-seen')}>
                      <span>Left Without Being Seen</span>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                  </div>
                </div>

                {/* Care Coordination Card */}
                <div className={styles.reportCard}>
                  <div className={styles.reportHeader}>
                    <div className={styles.reportIconBox} style={{ background: '#EFF6FF', color: '#2563EB' }}>
                      <HeartPulse size={18} />
                    </div>
                    <div>
                      <h2 className={styles.reportTitle}>Care Coordination</h2>
                      <div className={styles.reportSub}>Workflow efficiency</div>
                    </div>
                  </div>
                  <div className={styles.reportLinkList}>
                    <div className={styles.reportLinkItem} onClick={() => loadReport('consult-response-times')}>
                      <span>Consult Response Times</span>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                    <div className={styles.reportLinkItem} onClick={() => loadReport('discharge-delay-analysis')}>
                      <span>Discharge Delay Analysis</span>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                    <div className={styles.reportLinkItem} onClick={() => loadReport('care-pathway-adherence')}>
                      <span>Care Pathway Adherence</span>
                      <ChevronRight size={15} color="#94A3B8" />
                    </div>
                  </div>
                </div>
              </div>
                </>
              )}
            </>
          )}

          {/* ========================================================
              SCREEN 5: CARE ACTIONS TRACKING
             ======================================================== */}
          {activeTab === 'care-actions' && (
            <>
              <div className={styles.pageHeader}>
                <div className={styles.pageTitleGroup}>
                  <h1 className={styles.pageTitle}>Care Actions Tracking</h1>
                  <p className={styles.pageSub}>Monitor and manage clinical interventions across the network.</p>
                </div>
                <div className={styles.headerActions}>
                  <button className={styles.btnSecondary}><Download size={14} /> Export</button>
                  <button className={styles.btnPrimary}><Filter size={14} /> Advanced Filters</button>
                </div>
              </div>

              {/* 4 Stats Cards */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span className={styles.statLabel}>Pending Actions</span>
                    <div className={styles.statIcon} style={{ background: '#FEF3C7', color: '#D97706' }}><ClipboardList size={15} /></div>
                  </div>
                  <div className={styles.statValue}>42</div>
                  <span className={`${styles.statPill} ${styles.statPillCoral}`}>↗ +5 since yesterday</span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span className={styles.statLabel}>Completed Today</span>
                    <div className={styles.statIcon} style={{ background: '#ECFDF5', color: '#059669' }}><CheckCircle2 size={15} /></div>
                  </div>
                  <div className={styles.statValue}>128</div>
                  <span className={`${styles.statPill} ${styles.statPillGreen}`}>↗ +12% vs last week</span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span className={styles.statLabel}>Overdue</span>
                    <div className={styles.statIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}><AlertTriangle size={15} /></div>
                  </div>
                  <div className={styles.statValue} style={{ color: '#DC2626' }}>7</div>
                  <span className={`${styles.statPill} ${styles.statPillCoral}`}>Require immediate attention</span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span className={styles.statLabel}>Avg Resolution</span>
                    <div className={styles.statIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}><Timer size={15} /></div>
                  </div>
                  <div className={styles.statValue}>2.4<span style={{ fontSize: '1.25rem' }}>h</span></div>
                  <span className={`${styles.statPill} ${styles.statPillGreen}`}>↘ -0.5h vs average</span>
                </div>
              </div>

              {/* Table */}
              <div className={styles.tableContainer}>
                <div className={styles.tableHeaderBar}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <select className={styles.btnSecondary} style={{ padding: '4px 10px', fontSize: '0.8125rem' }}>
                      <option>All Statuses ▾</option>
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                    <select className={styles.btnSecondary} style={{ padding: '4px 10px', fontSize: '0.8125rem' }}>
                      <option>All Priorities ▾</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <button className={styles.iconBtn}><MoreVertical size={16} /></button>
                </div>

                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Patient / ID</th>
                      <th>Action Required</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assigned To</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbActions.map(act => (
                      <tr key={act.id}>
                        <td>
                          <div className={styles.patientCell}>
                            <div className={styles.patientInitialsCircle}>{act.initials}</div>
                            <div>
                              <div className={styles.patientName}>{act.patientName}</div>
                              <div className={styles.patientMRN}>MRN: {act.mrn}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{act.actionRequired}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{act.actionSubtitle}</div>
                        </td>
                        <td>
                          <span className={act.status === 'Completed' ? styles.badgeCompleted : act.status === 'Overdue' ? styles.badgeUrgent : act.status === 'In Progress' ? styles.badgeApproved : styles.badgePending}>
                            {act.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: act.priority === 'High' ? '#DC2626' : act.priority === 'Medium' ? '#D97706' : '#059669' }}>
                            {act.priority}
                          </span>
                        </td>
                        <td>
                          {act.assignedTo.isUnassigned ? (
                            <button className={styles.btnSecondary} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Assign</button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700, color: '#64748B' }}>
                                {act.assignedTo.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                              </div>
                              <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>{act.assignedTo.name}</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <button className={styles.btnSecondary} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                            {act.status === 'Completed' ? 'View' : 'Update'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748B' }}>
                  <span>Showing 1 to 3 of 42 entries</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className={styles.btnPrimary} style={{ padding: '2px 10px' }}>1</button>
                    <button className={styles.btnSecondary} style={{ padding: '2px 10px' }}>2</button>
                    <button className={styles.btnSecondary} style={{ padding: '2px 10px' }}>3</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ========================================================
              SCREEN 6: ED UTILIZATION ANALYTICS
             ======================================================== */}
          {activeTab === 'ed-utilization' && (
            <>
              <div className={styles.pageHeader}>
                <div className={styles.pageTitleGroup}>
                  <h1 className={styles.pageTitle}>ED Utilization Analytics</h1>
                  <p className={styles.pageSub}>Real-time monitoring of emergency department admissions and risk factors.</p>
                </div>
                <div className={styles.headerActions}>
                  <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 6, padding: 3, gap: 2 }}>
                    {['Today', '7D', '30D'].map(p => (
                      <button key={p} style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, border: 'none', borderRadius: 4, background: p === 'Today' ? 'white' : 'transparent', color: p === 'Today' ? '#0F172A' : '#64748B', cursor: 'pointer' }}>{p}</button>
                    ))}
                  </div>
                  <button className={styles.btnSecondary}><Download size={14} /> Export</button>
                </div>
              </div>

              {/* 4 Stats Cards */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span className={styles.statLabel}>Total ED Visits</span>
                    <div className={styles.statIcon} style={{ background: '#FFFBEB', color: '#D97706' }}><Sparkles size={15} /></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className={styles.statValue}>{dashboardData?.kpis?.total_ed_visits || '0'}</span>
                    <span className={`${styles.statPill} ${styles.statPillCoral}`}>↗ +12%</span>
                  </div>
                  <span className={styles.statSubtext}>vs previous 30 days</span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span className={styles.statLabel}>Potentially Avoidable</span>
                    <div className={styles.statIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}><Shield size={15} /></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span className={styles.statValue}>{dashboardData?.kpis?.avoidable_ed_visits || '0'}</span>
                    <span style={{ fontSize: '0.875rem', color: '#64748B' }}>/ 34.6%</span>
                  </div>
                  <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden', marginTop: 2 }}>
                    <div style={{ width: '34.6%', height: '100%', background: '#2563EB' }} />
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span className={styles.statLabel}>High Frequency Members</span>
                    <div className={styles.statIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}><Users size={15} /></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className={styles.statValue}>{dashboardData?.kpis?.high_frequency_members || '0'}</span>
                    <span className={`${styles.statPill} ${styles.statPillGreen}`}>↘ -3%</span>
                  </div>
                  <span className={styles.statSubtext}>Members with 3+ visits</span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statTop}>
                    <span className={styles.statLabel}>Estimated Cost</span>
                    <div className={styles.statIcon} style={{ background: '#ECFDF5', color: '#059669' }}><CheckCircle2 size={15} /></div>
                  </div>
                  <div className={styles.statValue}>${dashboardData?.kpis?.estimated_cost || '0'}</div>
                  <span className={styles.statSubtext}>YTD Accumulated</span>
                </div>
              </div>

              {/* Middle Row: Utilization Trends & High-Frequency List */}
              <div className={styles.splitGrid} style={{ gridTemplateColumns: '1.8fr 1fr' }}>
                <div className={styles.cardBox}>
                  <div className={styles.cardHeaderRow}>
                    <h2 className={styles.cardTitle}>Utilization Trends</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.75rem', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} /> Total</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} /> Avoidable</span>
                    </div>
                  </div>
                  <div style={{ height: 230, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData?.ed_trends || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                        <YAxis stroke="#94A3B8" fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="avoidable" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={styles.cardBox}>
                  <div className={styles.cardHeaderRow}>
                    <h2 className={styles.cardTitle}>High-Frequency List</h2>
                    <span className={styles.viewAllLink}>View All</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(dashboardData?.high_frequency_members || []).map((mem: any) => (
                      <div key={mem.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {mem.initials}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>{mem.name}</div>
                            <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>{mem.condition}</div>
                          </div>
                        </div>
                        <span style={{ padding: '2px 8px', background: mem.badgeColor, borderRadius: 4, fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>
                          {mem.visits} Visits
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Top Avoidable Diagnoses & AI Insights */}
              <div className={styles.splitGrid} style={{ gridTemplateColumns: '1.2fr 1.8fr' }}>
                <div className={styles.cardBox}>
                  <h2 className={styles.cardTitle}>Top Avoidable Diagnoses</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                    {(dashboardData?.avoidable_diagnoses || []).map((diag: any) => (
                      <div key={diag.code}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{diag.code} {diag.name}</span>
                          <strong style={{ color: '#0F172A' }}>{diag.count}</strong>
                        </div>
                        <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${diag.percentage}%`, height: '100%', background: '#2563EB' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.cardBox}>
                  <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} color="#2563EB" /> AI Utilization Insights
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#DC2626', fontWeight: 700, fontSize: '0.875rem' }}>
                        <AlertTriangle size={15} /> Weekend Spike Detected
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#7F1D1D', margin: '4px 0 8px' }}>
                        ED visits for pediatric asthma increased by 45% this past weekend. Recommend outreach to severe asthmatic cohort regarding recent air quality changes.
                      </p>
                      <button style={{ color: '#2563EB', fontWeight: 700, fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        GENERATE OUTREACH LIST
                      </button>
                    </div>

                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontWeight: 700, fontSize: '0.875rem' }}>
                        <CheckCircle2 size={15} /> Urgent Care Diversion Opportunity
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#166534', margin: '4px 0 0' }}>
                        72% of weekend UTI visits occurred within 5 miles of an in-network Urgent Care center. Consider targeted education campaigns for members in ZIP 90210.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ========================================================
              PATIENTS DIRECTORY
             ======================================================== */}
          {activeTab === 'patients' && (
            <>
              <div className={styles.pageHeader}>
                <div className={styles.pageTitleGroup}>
                  <h1 className={styles.pageTitle}>Patients Directory</h1>
                  <p className={styles.pageSub}>Clinical records and active cases across hospital departments.</p>
                </div>
                <button className={styles.btnPrimary} onClick={() => setIsNewRequestOpen(true)}>
                  <Plus size={15} /> Admit Patient
                </button>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>MRN</th>
                      <th>DOB / Age</th>
                      <th>Primary Care</th>
                      <th>Active Conditions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbRequests.map((req: any, idx) => {
                      const pName = req.patientName || req.patient_name || 'Unknown Patient';
                      const initials = pName.split(' ').map((n: string) => n[0]).join('').substring(0, 2);
                      return (
                      <tr key={req.id || idx}>
                        <td>
                          <div className={styles.patientCell}>
                            <div className={styles.patientInitialsCircle}>
                              {initials}
                            </div>
                            <div>
                              <div className={styles.patientName}>{pName}</div>
                              <div className={styles.patientMRN}>ID: {req.patientId || req.patient_id}</div>
                            </div>
                          </div>
                        </td>
                        <td>{req.mrn}</td>
                        <td>{req.dob || '45y'}</td>
                        <td>{req.primaryCare || 'Dr. Sarah Jenkins'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {(req.conditions || ['Hypertension']).map((c: string) => (
                              <span key={c} style={{ padding: '2px 6px', background: '#F1F5F9', borderRadius: 4, fontSize: '0.6875rem', fontWeight: 600 }}>
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <button
                            className={styles.btnSecondary}
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedRequest(req);
                              setActiveTab('care-requests');
                            }}
                          >
                            View Case
                          </button>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>

      {/* ── Modal: New Care Request ── */}
      {isNewRequestOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 20
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            width: '100%',
            maxWidth: 520,
            padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>New Care Request</h2>
              <button onClick={() => setIsNewRequestOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: 4 }}>
                  Patient Name or MRN
                </label>
                <input
                  type="text"
                  placeholder="e.g. Robert J. Evans or MRN-489221"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: 4 }}>
                  Request Type
                </label>
                <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}>
                  <option>Cardiology Consult</option>
                  <option>Skilled Nursing Facility (SNF) Placement</option>
                  <option>Imaging - MRI</option>
                  <option>Stat Labs</option>
                  <option>Discharge Order</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: 4 }}>
                  Priority Level
                </label>
                <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}>
                  <option>Urgent</option>
                  <option>Standard</option>
                  <option>Low</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: 4 }}>
                  Clinical Summary &amp; Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter clinical rationale..."
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button className={styles.btnSecondary} onClick={() => setIsNewRequestOpen(false)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={() => {
                alert('Care request created successfully!');
                setIsNewRequestOpen(false);
              }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
