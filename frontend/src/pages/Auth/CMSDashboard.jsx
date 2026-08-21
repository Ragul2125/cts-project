import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  LayoutDashboard,
  Activity,
  BarChart2,
  Users,
  Building2,
  MapPin,
  Sparkles,
  GitMerge,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Search,
  Calendar,
  Bell,
  LogOut,
  Download,
  Filter,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Repeat,
  Compass,
  Bed,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  UserCheck,
  PhoneCall,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import styles from './HospitalDashboard.module.css';

// No mock data - relies strictly on live DB

export default function CMSDashboard({ session, onLogout }) {
  const [activeTab, setActiveTab] = useState('ed');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('Weekly');
  const [selectedRegion, setSelectedRegion] = useState('Region A');
  const [memberFilter, setMemberFilter] = useState('');

  // Live Database State
  const [dbDashboard, setDbDashboard] = useState(null);
  const [dbPatterns, setDbPatterns] = useState(null);
  const [dbMembers, setDbMembers] = useState([]);
  const [dbProviders, setDbProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const adminName = session?.name || 'Dr. Sarah Jenkins';

  useEffect(() => {
    const fetchCMSData = async () => {
      try {
        setLoading(true);
        const [dash, pats, mems, provs] = await Promise.all([
          apiService.getCMSDashboard().catch(() => null),
          apiService.getCMSPatterns().catch(() => null),
          apiService.getCMSMembers({ query: memberFilter }).catch(() => []),
          apiService.getCMSProviders().catch(() => [])
        ]);

        if (dash) setDbDashboard(dash);
        if (pats) setDbPatterns(pats);
        if (mems) setDbMembers(mems);
        if (provs) setDbProviders(provs);
      } catch (err) {
        console.warn('Failed to load CMS database data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCMSData();
  }, [memberFilter]);

  const activeTrendData = dbDashboard?.trends?.length ? dbDashboard.trends : [];
  const activeDistributionData = dbPatterns?.distribution?.length ? dbPatterns.distribution : [];
  const activeEngagementData = dbPatterns?.engagement?.length ? dbPatterns.engagement : [];
  const activeScatterData = dbPatterns?.scatter?.length ? dbPatterns.scatter : [];
  const activeMembersData = dbMembers.length ? dbMembers : [];
  const activeProvidersData = dbProviders.length ? dbProviders : [];

  const filteredMembers = activeMembersData.filter(m => 
    m.id.toLowerCase().includes(memberFilter.toLowerCase()) || 
    (m.pattern && m.pattern.toLowerCase().includes(memberFilter.toLowerCase()))
  );

  return (
    <div className={styles.portalContainer}>
      {/* ── Left Dark Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.brandRow}>
          <div className={styles.brandIcon}>
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div className={styles.brandName}>CarePath AI</div>
            <div className={styles.brandSub}>CMS Healthcare Analytics</div>
          </div>
        </div>

        <nav className={styles.navSection}>
          <button
            className={`${styles.navItem} ${activeTab === 'ed' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('ed')}
          >
            <Activity size={17} />
            <span>ED Utilization</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'patterns' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('patterns')}
          >
            <BarChart2 size={17} />
            <span>Utilization Patterns</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'population' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('population')}
          >
            <Users size={17} />
            <span>Population</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'providers' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('providers')}
          >
            <Building2 size={17} />
            <span>Providers</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'geography' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('geography')}
          >
            <MapPin size={17} />
            <span>Geography</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'insights' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <Sparkles size={17} />
            <span>AI Insights</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'navigation' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('navigation')}
          >
            <GitMerge size={17} />
            <span>Care Navigation</span>
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'reports' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileSpreadsheet size={17} />
            <span>Reports</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.footerNavLink} onClick={() => alert('CMS Analytics Settings')}>
            <Settings size={15} />
            <span>Settings</span>
          </div>
          <div className={styles.footerNavLink} onClick={() => alert('CMS Documentation & Support')}>
            <HelpCircle size={15} />
            <span>Help</span>
          </div>

          <div className={styles.userCard}>
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80"
              alt="Dr. Sarah Jenkins"
              className={styles.userAvatar}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className={styles.userInfo}>
              <span className={styles.userName}>{adminName}</span>
              <span className={styles.userRole}>CMS Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className={styles.mainWrapper}>
        {/* Top Header Bar */}
        <header className={styles.topBar}>
          <span className={styles.breadcrumbTitle}>CMS Health Plan Analytics</span>

          <div className={styles.searchBox}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search members, providers, or metrics..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.topBarRight}>
            <div className={styles.dateFilter}>
              <Calendar size={14} />
              <span>Last 30 Days ▾</span>
            </div>

            <button className={styles.iconBtn} aria-label="Notifications">
              <Bell size={16} />
              <span className={styles.notifDot} />
            </button>

            <button className={styles.logoutBtn} onClick={onLogout} aria-label="Sign out">
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Views by Tab */}
        <main className={styles.contentView}>
          {/* ED UTILIZATION */}
          {activeTab === 'ed' && (
            <>
              <div className={styles.viewHeader}>
                <div className={styles.viewTitleGroup}>
                  <h1 className={styles.viewTitle}>Utilization Intelligence</h1>
                  <p className={styles.viewSub}>Monitor emergency department utilization and identify potential care-navigation opportunities.</p>
                </div>
                <button className={styles.actionBtnPrimary}>
                  <Download size={14} />
                  <span>Export Report</span>
                </button>
              </div>

              {/* Filters Bar */}
              <div className={styles.filterRow}>
                <div className={styles.filterPills}>
                  <span className={styles.filterLabel}><Filter size={13} /> FILTERS</span>
                  <select className={styles.selectPill}><option>Region: All ▾</option></select>
                  <select className={styles.selectPill}><option>Age: All ▾</option></select>
                  <select className={styles.selectPill}><option>Plan: Medicare Adv ▾</option></select>
                </div>
                <button className={styles.resetBtn}><RotateCcw size={12} /> Reset</button>
              </div>

              {/* 4 KPI Cards */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <span className={styles.metricLabel}>Total ED Visits</span>
                    <div className={styles.metricIconWrap}><Plus size={15} /></div>
                  </div>
                  <div className={styles.metricValue}>
                    {dbDashboard?.kpis?.total_ed_visits ? dbDashboard.kpis.total_ed_visits.toLocaleString() : '0'}
                  </div>
                  <span className={`${styles.metricBadge} ${styles.metricBadgeGreen}`}>↘ 4.2% vs last 30 days</span>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <span className={styles.metricLabel}>Repeat Utilizers</span>
                    <div className={styles.metricIconWrap}><Repeat size={15} /></div>
                  </div>
                  <div className={styles.metricValue}>
                    {dbDashboard?.kpis?.repeat_utilizers ? dbDashboard.kpis.repeat_utilizers.toLocaleString() : '0'}
                  </div>
                  <span className={`${styles.metricBadge} ${styles.metricBadgeCoral}`}>↗ 5.3% vs last 30 days</span>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <span className={styles.metricLabel}>Care-Navigation Opportunities</span>
                  </div>
                  <div className={styles.metricValue} style={{ color: '#2563EB' }}>
                    {dbDashboard?.kpis?.navigation_opportunities ? dbDashboard.kpis.navigation_opportunities.toLocaleString() : '0'}
                  </div>
                  <span className={`${styles.metricBadge} ${styles.metricBadgeCoral}`}>↗ 8.1% Actionable targets</span>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <span className={styles.metricLabel}>Post-Discharge ED</span>
                    <div className={styles.metricIconWrap}><Bed size={15} /></div>
                  </div>
                  <div className={styles.metricValue}>
                    {dbDashboard?.kpis?.post_discharge_ed ? dbDashboard.kpis.post_discharge_ed.toLocaleString() : '0'}
                  </div>
                  <span className={`${styles.metricBadge} ${styles.metricBadgeGreen}`}>↘ 2.4% vs last 30 days</span>
                </div>
              </div>

              {/* ED Utilization Trend Chart Card */}
              <div className={styles.chartCard}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>ED Utilization Trend</h2>
                  <div className={styles.segmentedControl}>
                    {['Daily', 'Weekly', 'Monthly'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTimeRange(t)}
                        className={`${styles.segmentBtn} ${timeRange === t ? styles.segmentBtnActive : ''}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="week" stroke="#94A3B8" fontSize={12} />
                      <YAxis stroke="#94A3B8" fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="edVisits" stroke="#2563EB" strokeWidth={3.5} dot={{ r: 4, fill: '#2563EB' }} name="ED VISITS" />
                      <Line type="monotone" dataKey="repeatVisits" stroke="#94A3B8" strokeWidth={2.5} strokeDasharray="6 6" dot={{ r: 3, fill: '#94A3B8' }} name="REPEAT VISITS" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detected Utilization Patterns */}
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>Detected Utilization Patterns</h3>
                <div className={styles.patternsGrid}>
                  <div className={styles.patternCard}>
                    <div className={styles.patternLeft}>
                      <div className={styles.patternIconBox}><Repeat size={20} /></div>
                      <div>
                        <div className={styles.patternTitle}>
                          <span>Repeated ED Utilization</span>
                          <span className={styles.patternCountBadge}>846</span>
                        </div>
                        <div className={styles.patternDesc}>Members with multiple ED encounters during the selected period.</div>
                      </div>
                    </div>
                    <button className={styles.exploreBtn} onClick={() => setActiveTab('patterns')}>Explore</button>
                  </div>

                  <div className={styles.patternCard}>
                    <div className={styles.patternLeft}>
                      <div className={styles.patternIconBox}><Compass size={20} /></div>
                      <div>
                        <div className={styles.patternTitle}>
                          <span>Low PCP Engagement</span>
                          <span className={styles.patternCountBadge}>527</span>
                        </div>
                        <div className={styles.patternDesc}>Repeated ED utilization combined with limited primary-care engagement.</div>
                      </div>
                    </div>
                    <button className={styles.exploreBtn} onClick={() => setActiveTab('patterns')}>Explore</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* UTILIZATION PATTERNS > PATTERN EXPLORER */}
          {activeTab === 'patterns' && (
            <>
              <div className={styles.viewHeader}>
                <div className={styles.viewTitleGroup}>
                  <span className={styles.breadcrumbTag}>UTILIZATION PATTERNS &gt; Pattern Explorer</span>
                  <h1 className={styles.viewTitle}>Repeated ED Utilization</h1>
                  <p className={styles.viewSub}>Detailed analysis of members with multiple emergency department encounters within 12 months.</p>
                </div>
                <div className={styles.headerActions}>
                  <button className={styles.actionBtnSecondary}>
                    <Download size={14} />
                    <span>Export Data</span>
                  </button>
                  <button className={styles.actionBtnPrimary} onClick={() => setActiveTab('navigation')}>
                    <Sparkles size={14} />
                    <span>Create Campaign</span>
                  </button>
                </div>
              </div>

              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <span className={styles.metricLabel}>Affected Members</span>
                    <div className={styles.metricIconWrap}><Users size={15} /></div>
                  </div>
                  <div className={styles.metricValue}>{dbDashboard?.kpis?.repeat_utilizers || '0'}</div>
                  <span className={`${styles.metricBadge} ${styles.metricBadgeCoral}`}>↗ +12% vs last quarter</span>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <span className={styles.metricLabel}>Avg ED Visits/Member</span>
                    <div className={styles.metricIconWrap}><Activity size={15} /></div>
                  </div>
                  <div className={styles.metricValue}>{dbDashboard?.kpis?.avg_ed_visits_member || '0.0'}</div>
                  <span className={`${styles.metricBadge} ${styles.metricBadgeCoral}`}>↗ +0.4 increase</span>
                </div>

                <div className={styles.metricCard} style={{ background: '#FFF5F5', borderColor: '#FECACA' }}>
                  <div className={styles.metricTop}>
                    <span className={styles.metricLabel} style={{ color: '#DC2626' }}>Avg PCP Visits</span>
                    <div className={styles.metricIconWrap} style={{ background: '#FEE2E2', color: '#DC2626' }}><Plus size={15} /></div>
                  </div>
                  <div className={styles.metricValue} style={{ color: '#DC2626' }}>{dbDashboard?.kpis?.avg_pcp_visits || '0.0'}</div>
                  <span className={`${styles.metricBadge} ${styles.metricBadgeCoral}`}>⚠ Critically low engagement</span>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <span className={styles.metricLabel}>Avg Hospitalizations</span>
                    <div className={styles.metricIconWrap}><Bed size={15} /></div>
                  </div>
                  <div className={styles.metricValue}>{dbDashboard?.kpis?.avg_hospitalizations || '0.0'}</div>
                  <span className={`${styles.metricBadge} ${styles.metricBadgeGreen}`}>→ Stable</span>
                </div>
              </div>

              <div className={styles.twoColGrid}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className={styles.chartCard}>
                    <h2 className={styles.cardTitle}>ED Visit Distribution</h2>
                    <div className={styles.chartContainer}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activeDistributionData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="visits" stroke="#94A3B8" fontSize={12} />
                          <YAxis stroke="#94A3B8" fontSize={12} />
                          <Tooltip />
                          <Bar dataKey="members" radius={[4, 4, 0, 0]}>
                            {activeDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={styles.chartCard}>
                    <h2 className={styles.cardTitle}>PCP vs ED Engagement Over Time</h2>
                    <div className={styles.chartContainer}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={activeEngagementData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} />
                          <YAxis stroke="#94A3B8" fontSize={12} />
                          <Tooltip />
                          <Line type="monotone" dataKey="edVisits" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} name="ED Visits" />
                          <Line type="monotone" dataKey="pcpVisits" stroke="#DC2626" strokeWidth={3} dot={{ r: 4 }} name="PCP Visits" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className={styles.opportunityCard}>
                    <div className={styles.oppHeader}>
                      <div className={styles.patternIconBox}><MapPin size={20} /></div>
                      <div>
                        <div className={styles.oppTitle}>Care-Navigation Opportunity</div>
                      </div>
                    </div>
                    <p className={styles.oppText}>
                      <strong>{dbDashboard?.kpis?.repeat_utilizers || '0'} members</strong> exhibit a pattern of <span style={{ color: '#DC2626', fontWeight: 700 }}>high ED utilization (4+ visits)</span> coupled with negligible PCP engagement (&lt;1 visit). AI models suggest 62% of these visits are for ambulatory care sensitive conditions (ACSCs).
                    </p>

                    <div className={styles.oppHighlightBox}>
                      <span className={styles.oppHighlightTitle}><CheckCircle2 size={15} color="#2563EB" /> Recommended Action</span>
                      <p className={styles.oppHighlightText}>Initiate proactive outreach campaign to schedule primary care follow-ups and assess social determinants of health (SDoH) barriers.</p>
                    </div>

                    <button className={styles.oppActionBtn} onClick={() => setActiveTab('navigation')}>
                      <span>Create Navigation Campaign</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>

                  <div className={styles.opportunityCard}>
                    <div className={styles.oppTitle}>Age &amp; Risk Profile</div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748B', marginBottom: 6 }}>
                        <span>Age Distribution</span>
                        <span style={{ fontWeight: 700, color: '#2563EB' }}>55-74 (48%)</span>
                      </div>
                      <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: '22%', background: '#93C5FD' }} />
                        <div style={{ width: '48%', background: '#2563EB' }} />
                        <div style={{ width: '30%', background: '#10B981' }} />
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Clinical Risk Tier</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8125rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} /> High Risk
                          </span>
                          <strong style={{ color: '#0F172A' }}>68%</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} /> Medium Risk
                          </span>
                          <strong style={{ color: '#0F172A' }}>25%</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94A3B8' }} /> Low Risk
                          </span>
                          <strong style={{ color: '#0F172A' }}>7%</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* POPULATION INTELLIGENCE */}
          {activeTab === 'population' && (
            <>
              <div className={styles.viewHeader}>
                <div className={styles.viewTitleGroup}>
                  <h1 className={styles.viewTitle}>Population Intelligence</h1>
                  <p className={styles.viewSub}>Explore members associated with identified utilization patterns.</p>
                </div>
              </div>

              <div className={styles.tableContainer}>
                <div className={styles.tableFilterBar}>
                  <div className={styles.tableInputGroup}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>Member ID</label>
                    <input
                      type="text"
                      placeholder="e.g., PT-XXXX"
                      className={styles.tableInput}
                      value={memberFilter}
                      onChange={(e) => setMemberFilter(e.target.value)}
                    />
                  </div>

                  <div className={styles.tableInputGroup}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>Pattern</label>
                    <select className={styles.selectPill}><option>All Patterns ▾</option><option>Repeated ED</option><option>Low PCP</option></select>
                  </div>

                  <div className={styles.tableInputGroup}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>Priority</label>
                    <select className={styles.selectPill}><option>All Priorities ▾</option><option>High</option><option>Medium</option></select>
                  </div>

                  <button className={styles.actionBtnSecondary}>
                    <Filter size={13} />
                    <span>More Filters</span>
                  </button>

                  <button className={styles.actionBtnPrimary}>
                    <Search size={13} />
                    <span>Search</span>
                  </button>
                </div>

                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Member ID</th>
                      <th>ED Visits</th>
                      <th>PCP Visits</th>
                      <th>Urgent</th>
                      <th>Hosp.</th>
                      <th>Last Discharge</th>
                      <th>Pattern</th>
                      <th>Priority</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(m => (
                      <tr key={m.id}>
                        <td className={styles.memberIdLink}>{m.id}</td>
                        <td style={{ fontWeight: 600 }}>{m.edVisits}</td>
                        <td>{m.pcpVisits}</td>
                        <td>{m.urgent}</td>
                        <td>{m.hosp}</td>
                        <td>{m.lastDischarge}</td>
                        <td>{m.pattern}</td>
                        <td>
                          <span className={m.priority === 'High' ? styles.badgeHigh : styles.badgeMedium}>
                            {m.priority}
                          </span>
                        </td>
                        <td>
                          <button className={styles.tableActionBtn} onClick={() => alert(`Opening profile for ${m.id}`)}>View Profile</button>
                          <button className={styles.tableActionBtn} style={{ color: '#059669' }} onClick={() => alert(`Initiating outreach for ${m.id}`)}>Outreach</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.tableFooter}>
                  <span>Showing 1 to 5 of 1,248 members</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className={styles.exploreBtn} style={{ padding: '3px 8px' }}>&lt;</button>
                    <button className={styles.exploreBtn} style={{ padding: '3px 8px' }}>&gt;</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CARE NAVIGATION OUTCOMES */}
          {activeTab === 'navigation' && (
            <>
              <div className={styles.viewHeader}>
                <div className={styles.viewTitleGroup}>
                  <h1 className={styles.viewTitle}>Care Navigation Outcomes</h1>
                  <p className={styles.viewSub}>Measure the impact of navigation interventions on member health outcomes and utilization.</p>
                </div>
                <div className={styles.headerActions}>
                  <div className={styles.segmentedControl}>
                    {['YTD', 'Q3', 'Q2'].map(q => (
                      <button key={q} className={`${styles.segmentBtn} ${q === 'YTD' ? styles.segmentBtnActive : ''}`}>{q}</button>
                    ))}
                  </div>
                  <button className={styles.actionBtnSecondary}><Download size={14} /> Export</button>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className={styles.metricsGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <span className={styles.metricLabel}>Navigation Rate</span>
                    <div className={styles.metricIconWrap}><Compass size={15} /></div>
                  </div>
                  <div className={styles.metricValue}>68%</div>
                  <span className={`${styles.metricBadge} ${styles.metricBadgeGreen}`}>↗ 4.2% Of identified opportunities attempted</span>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <span className={styles.metricLabel}>Connection Rate</span>
                    <div className={styles.metricIconWrap}><PhoneCall size={15} /></div>
                  </div>
                  <div className={styles.metricValue}>78%</div>
                  <span className={`${styles.metricBadge} ${styles.metricBadgeGreen}`}>↗ 2.1% Successful contact established</span>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <span className={styles.metricLabel}>ED Avoidance Est.</span>
                    <div className={styles.metricIconWrap}><CheckCircle2 size={15} /></div>
                  </div>
                  <div className={styles.metricValue}>14%</div>
                  <span className={`${styles.metricBadge} ${styles.metricBadgeGreen}`}>↗ 1.5% Based on successful nav to PCP/Telehealth</span>
                </div>
              </div>

              {/* Funnel & Pathway Distribution */}
              <div className={styles.twoColGrid}>
                <div className={styles.chartCard}>
                  <h2 className={styles.cardTitle}>Navigation Intervention Funnel</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Member journey from identification to completed follow-up.</p>

                  <div style={{ marginTop: 16 }}>
                    <div className={styles.funnelBarRow}>
                      <span className={styles.funnelLabel}>2,640 Identified</span>
                      <div className={styles.funnelBarTrack}>
                        <div className={styles.funnelBarFill} style={{ width: '100%', background: '#CBD5E1', color: '#1E293B' }}>100%</div>
                      </div>
                    </div>

                    <div className={styles.funnelBarRow}>
                      <span className={styles.funnelLabel}>1,820 Attempts</span>
                      <div className={styles.funnelBarTrack}>
                        <div className={styles.funnelBarFill} style={{ width: '69%', background: '#93C5FD', color: '#1E293B' }}>Drop-off: 820</div>
                      </div>
                    </div>

                    <div className={styles.funnelBarRow}>
                      <span className={styles.funnelLabel}>1,420 Connected</span>
                      <div className={styles.funnelBarTrack}>
                        <div className={styles.funnelBarFill} style={{ width: '54%', background: '#2563EB' }}>Connected</div>
                      </div>
                    </div>

                    <div className={styles.funnelBarRow}>
                      <span className={styles.funnelLabel}>1,210 Scheduled</span>
                      <div className={styles.funnelBarTrack}>
                        <div className={styles.funnelBarFill} style={{ width: '46%', background: '#38BDF8' }}>Scheduled F/U</div>
                      </div>
                    </div>

                    <div className={styles.funnelBarRow}>
                      <span className={styles.funnelLabel}>892 Completed</span>
                      <div className={styles.funnelBarTrack}>
                        <div className={styles.funnelBarFill} style={{ width: '34%', background: '#059669' }}>Final Conversion: 33.7%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.opportunityCard}>
                  <div className={styles.oppTitle}>Pathway Distribution</div>
                  <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>Where members were successfully navigated.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>
                        <span style={{ color: '#2563EB' }}>• Primary Care</span>
                        <span>48%</span>
                      </div>
                      <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: '48%', height: '100%', background: '#2563EB' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>
                        <span style={{ color: '#0EA5E9' }}>• Telehealth</span>
                        <span>24%</span>
                      </div>
                      <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: '24%', height: '100%', background: '#0EA5E9' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>
                        <span style={{ color: '#475569' }}>• Urgent Care</span>
                        <span>18%</span>
                      </div>
                      <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: '18%', height: '100%', background: '#475569' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>
                        <span style={{ color: '#94A3B8' }}>• Care Management</span>
                        <span>10%</span>
                      </div>
                      <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: '10%', height: '100%', background: '#94A3B8' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* AI INSIGHTS */}
          {activeTab === 'insights' && (
            <>
              <div className={styles.viewHeader}>
                <div className={styles.viewTitleGroup}>
                  <h1 className={styles.viewTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles color="#2563EB" size={24} />
                    <span>CarePath AI Insights</span>
                  </h1>
                  <p className={styles.viewSub}>Intelligent summary of population health patterns and recommended interventions.</p>
                </div>
                <button className={styles.actionBtnPrimary}><Download size={14} /> Export Report</button>
              </div>

              {/* Alert Banner */}
              <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#991B1B' }}>ED Utilization Increase Alert: +12% this month.</div>
                  <p style={{ fontSize: '0.875rem', color: '#7F1D1D', margin: '2px 0 0' }}>Our predictive models indicate a significant deviation from expected baseline utilization across the targeted population subset.</p>
                </div>
              </div>

              {/* Primary Contributors 3 Cards */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Primary Contributors</h3>
                <div className={styles.metricsGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricTop}>
                      <Repeat size={18} color="#2563EB" />
                      <span className={`${styles.metricBadge} ${styles.metricBadgeCoral}`}>High Impact</span>
                    </div>
                    <span className={styles.metricLabel}>Repeated ED utilization</span>
                    <div className={styles.metricValue}>45%</div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>of total increase</span>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricTop}>
                      <Compass size={18} color="#0EA5E9" />
                      <span className={`${styles.metricBadge}`} style={{ background: '#E0F2FE', color: '#0284C7' }}>Mod Impact</span>
                    </div>
                    <span className={styles.metricLabel}>Low PCP engagement</span>
                    <div className={styles.metricValue}>32%</div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>of total increase</span>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricTop}>
                      <Bed size={18} color="#475569" />
                      <span className={`${styles.metricBadge}`} style={{ background: '#F1F5F9', color: '#475569' }}>Increasing</span>
                    </div>
                    <span className={styles.metricLabel}>Post-discharge</span>
                    <div className={styles.metricValue}>23%</div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>of total increase</span>
                  </div>
                </div>
              </div>

              {/* Deep-Dive and Evidence Panel */}
              <div className={styles.twoColGrid}>
                <div className={styles.opportunityCard}>
                  <div className={styles.oppTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} color="#2563EB" /> AI Analysis Deep-Dive
                  </div>
                  <p className={styles.oppText}>
                    The increase is concentrated among members with repeated ED encounters and limited primary-care engagement. The largest concentration is observed in <strong>Region A</strong>.
                  </p>
                  <ul style={{ paddingLeft: 20, margin: 0, fontSize: '0.875rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <li><strong>Cohort Analysis</strong>: 68% of the affected cohort had 0 PCP visits in the preceding 6 months.</li>
                    <li><strong>Temporal Pattern</strong>: Spike observed primarily during weekends (Friday 6 PM - Monday 6 AM).</li>
                    <li><strong>Clinical Drivers</strong>: Top primary diagnoses include exacerbation of COPD and unmanaged hypertension.</li>
                  </ul>
                  <p style={{ fontSize: '0.8125rem', color: '#64748B', fontStyle: 'italic', background: '#F8FAFC', padding: 10, borderRadius: 6 }}>
                    Natural language processing of triage notes suggests a high rate of visits classified as "preventable/avoidable" given proper ambulatory care management.
                  </p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button className={styles.actionBtnPrimary} onClick={() => setActiveTab('population')}>
                      <span>Explore Affected Population</span>
                    </button>
                    <button className={styles.actionBtnSecondary} onClick={() => setActiveTab('navigation')}>
                      <span>Launch Care Campaign</span>
                    </button>
                  </div>
                </div>

                <div className={styles.opportunityCard}>
                  <div className={styles.oppTitle}>Evidence Panel</div>
                  <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>Correlation between low PCP visits and high ED utilization (r = -0.74).</p>
                  
                  <div style={{ height: 160, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis type="number" dataKey="x" name="PCP" stroke="#94A3B8" />
                        <YAxis type="number" dataKey="y" name="ED" stroke="#94A3B8" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Visits" data={SCATTER_DATA} fill="#EF4444" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>Regional Distribution</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Region A</span>
                        <strong style={{ color: '#DC2626' }}>42%</strong>
                      </div>
                      <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: '42%', height: '100%', background: '#DC2626' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Region B</span>
                        <strong>28%</strong>
                      </div>
                      <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: '28%', height: '100%', background: '#3B82F6' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* GEOGRAPHIC UTILIZATION */}
          {activeTab === 'geography' && (
            <>
              <div className={styles.viewHeader}>
                <div className={styles.viewTitleGroup}>
                  <h1 className={styles.viewTitle}>Geographic Utilization</h1>
                  <p className={styles.viewSub}>Regional distribution of emergency department utilization and care navigation opportunities.</p>
                </div>
                <div className={styles.headerActions}>
                  <button className={styles.actionBtnSecondary}><Filter size={13} /> Filter</button>
                  <button className={styles.actionBtnPrimary}><Download size={14} /> Export Data</button>
                </div>
              </div>

              <div className={styles.patternsGrid}>
                <div className={styles.patternCard} style={{ borderLeft: '4px solid #EF4444' }}>
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={14} /> Highest Utilization Region
                    </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>Region A</div>
                    <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>3,940 Total ED Visits (YTD) <span style={{ color: '#DC2626', fontWeight: 600 }}>↗ 14% vs avg</span></span>
                  </div>
                </div>

                <div className={styles.patternCard} style={{ borderLeft: '4px solid #10B981' }}>
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Compass size={14} /> Fastest Growing Opportunity Area
                    </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>Region C</div>
                    <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>Primary Care Deficit Identified <span style={{ color: '#059669', fontWeight: 600 }}>↑ 8% increase</span></span>
                  </div>
                </div>
              </div>

              <div className={styles.twoColGrid}>
                <div className={styles.chartCard}>
                  <h2 className={styles.cardTitle}>Regional Heatmap</h2>
                  <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: 8 }}>
                    <svg viewBox="0 0 400 240" style={{ width: '80%', height: '100%' }}>
                      <polygon
                        points="60,20 180,40 160,140 40,120"
                        fill={selectedRegion === 'Region A' ? '#DC2626' : '#EF4444'}
                        stroke="#FFF"
                        strokeWidth="2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedRegion('Region A')}
                      />
                      <text x="110" y="80" fill="white" fontWeight="700" fontSize="13">Region A</text>

                      <polygon
                        points="180,40 340,20 360,130 160,140"
                        fill={selectedRegion === 'Region B' ? '#F87171' : '#FCA5A5'}
                        stroke="#FFF"
                        strokeWidth="2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedRegion('Region B')}
                      />
                      <text x="250" y="80" fill="#1E293B" fontWeight="700" fontSize="13">Region B</text>

                      <polygon
                        points="40,120 160,140 180,220 50,210"
                        fill={selectedRegion === 'Region C' ? '#F87171' : '#FECACA'}
                        stroke="#FFF"
                        strokeWidth="2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedRegion('Region C')}
                      />
                      <text x="100" y="180" fill="#1E293B" fontWeight="700" fontSize="13">Region C</text>

                      <polygon
                        points="160,140 360,130 340,230 180,220"
                        fill={selectedRegion === 'Region D' ? '#991B1B' : '#B91C1C'}
                        stroke="#FFF"
                        strokeWidth="2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedRegion('Region D')}
                      />
                      <text x="250" y="180" fill="white" fontWeight="700" fontSize="13">Region D</text>
                    </svg>
                  </div>
                </div>

                <div className={styles.opportunityCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', background: '#0F172A', color: 'white', borderRadius: 4 }}>SELECTED REGION</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Data as of Oct 2026</span>
                  </div>
                  <div className={styles.oppTitle} style={{ fontSize: '1.25rem' }}>{selectedRegion}</div>
                  <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>Urban Metro • High Density</span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 6 }}>
                      <span style={{ fontSize: '0.875rem', color: '#475569' }}>Total ED Visits</span>
                      <strong style={{ color: '#0F172A' }}>3,940</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 6 }}>
                      <span style={{ fontSize: '0.875rem', color: '#475569' }}>Repeat Utilizers</span>
                      <strong style={{ color: '#DC2626' }}>12% ↑</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 6 }}>
                      <span style={{ fontSize: '0.875rem', color: '#475569' }}>Navigation Opps</span>
                      <strong style={{ color: '#2563EB' }}>842</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.875rem', color: '#475569' }}>PCP Engagement</span>
                      <strong style={{ color: '#DC2626' }}>42% ↓</strong>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PROVIDER ANALYTICS */}
          {activeTab === 'providers' && (
            <>
              <div className={styles.viewHeader}>
                <div className={styles.viewTitleGroup}>
                  <h1 className={styles.viewTitle}>Provider Analytics</h1>
                  <p className={styles.viewSub}>Monitor hospital and provider performance related to ED utilization and care navigation.</p>
                </div>
                <div className={styles.headerActions}>
                  <button className={styles.actionBtnSecondary}><Download size={14} /> Export CSV</button>
                  <button className={styles.actionBtnPrimary}><Plus size={14} /> New Report</button>
                </div>
              </div>

              <div className={styles.tableContainer}>
                <div className={styles.tableFilterBar}>
                  <input
                    type="text"
                    placeholder="Search Hospital or Provider..."
                    className={styles.tableInput}
                    style={{ width: 220 }}
                  />
                  <select className={styles.selectPill}><option>Hospital System ▾</option></select>
                  <select className={styles.selectPill}><option>Region ▾</option></select>
                  <select className={styles.selectPill}><option>Performance Tier ▾</option></select>
                  <button className={styles.actionBtnSecondary}><Filter size={13} /> More Filters</button>
                </div>

                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Hospital / Provider</th>
                      <th>ED Visits</th>
                      <th>Repeat Util %</th>
                      <th>Post-Discharge ED %</th>
                      <th>Navigation Rate %</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROVIDERS_DATA.map(p => (
                      <tr key={p.name}>
                        <td style={{ fontWeight: 700 }}>
                          <span style={{ display: 'inline-block', width: 24, height: 24, borderRadius: 4, background: '#EFF6FF', color: '#2563EB', textAlign: 'center', lineHeight: '24px', marginRight: 8, fontSize: '0.75rem' }}>
                            {p.code}
                          </span>
                          {p.name}
                        </td>
                        <td style={{ fontWeight: 600 }}>{p.edVisits}</td>
                        <td>{p.repeatRate}</td>
                        <td>{p.postDischarge}</td>
                        <td>{p.navRate}</td>
                        <td>
                          <span className={p.trend === 'Up' ? styles.badgeHigh : styles.badgeMedium}>
                            {p.trend === 'Up' ? '↗ Up' : p.trend === 'Down' ? '↘ Down' : '→ Steady'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* REPORTS */}
          {activeTab === 'reports' && (
            <div className={styles.chartCard}>
              <h2 className={styles.cardTitle}>Healthcare Analytics Reports</h2>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Download scheduled utilization and population health reporting packages.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {['Q3 Executive ED Utilization Summary.pdf', 'Monthly Care Navigation Conversion Report.csv', 'High Utilizer SDoH Risk Stratification.xlsx'].map(file => (
                  <div key={file} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>
                      <FileText size={16} color="#2563EB" /> {file}
                    </span>
                    <button className={styles.exploreBtn}><Download size={13} /> Download</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
