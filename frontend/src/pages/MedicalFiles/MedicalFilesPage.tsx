import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Upload, 
  FlaskConical, 
  FileScan, 
  Syringe, 
  HeartPulse, 
  FileText, 
  Download, 
  Sparkles, 
  Droplet, 
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  Trash2
} from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { MedicalFile } from '../../types';
import { apiService } from '../../services/api';
import './MedicalFilesPage.css';

export const MedicalFilesPage: React.FC = () => {
  const { medicalFiles, selectedFile, setSelectedFile, addMedicalFile, deleteMedicalFile } = usePatient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PDF' | 'JPEG' | 'Reviewed'>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name'>('newest');
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Upload Form State
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadProvider, setUploadProvider] = useState('');
  const [uploadFileType, setUploadFileType] = useState('PDF');
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const filteredFiles = useMemo(() => {
    return medicalFiles
      .filter(file => {
        const matchesQuery = 
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.date.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesQuery) return false;

        if (filterType === 'PDF') return file.type === 'PDF';
        if (filterType === 'JPEG') return file.type === 'JPEG' || file.type === 'PNG';
        if (filterType === 'Reviewed') return file.status === 'Reviewed' || file.status === 'Verified';

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'name') return a.name.localeCompare(b.name);
        // Default newest/oldest (mocked ordering)
        return sortOrder === 'oldest' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
      });
  }, [medicalFiles, searchQuery, filterType, sortOrder]);

  const activeDoc = selectedFile || filteredFiles[0] || null;

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim() || !selectedUploadFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(25);
      
      const patientId = localStorage.getItem('carepath_member_id') || '204';
      
      setUploadProgress(50);
      const response = await fetch(`/api/medical-files?patient_id=${(selectedUploadFile as any).patient_id}`);
      await apiService.uploadMedicalFile(patientId, selectedUploadFile, uploadFileName.trim());
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadFileName('');
        setUploadProvider('');
        setSelectedUploadFile(null);
        setShowUploadModal(false);
        window.location.reload();
      }, 500);

    } catch (err) {
      console.error('Failed to upload file:', err);
      alert('Failed to upload medical file.');
      setIsUploading(false);
    }
  };

  const getFileIcon = (iconType: string) => {
    switch (iconType) {
      case 'blood':
        return <FlaskConical size={22} />;
      case 'xray':
        return <FileScan size={22} />;
      case 'vaccine':
        return <Syringe size={22} />;
      default:
        return <FileText size={22} />;
    }
  };

  const handleDownload = (doc: MedicalFile) => {
    const content = `Document Name: ${doc.name}
Provider: ${doc.provider}
Date: ${doc.date}
Type: ${doc.type}
Status: ${doc.status}

=== AI SUMMARY ===
Overview: ${doc.aiSummary?.overview || 'N/A'}

Observations:
${doc.aiSummary?.keyObservations?.map(o => `- ${o.label}: ${o.value} (${o.reference})`).join('\n') || 'None'}

Disclaimer: ${doc.aiSummary?.disclaimer || ''}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.name.replace(/\s+/g, '_')}_summary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="medical-files-page animate-fade-in">
      <header className="files-header">
        <div className="files-title-group">
          <h1 className="page-title">Medical Files</h1>
          <p className="page-subtitle">Your health documents, securely organized in one place.</p>
        </div>

        <div className="files-actions-group">
          <button 
            type="button" 
            className={`btn btn-secondary filter-btn ${filterType !== 'ALL' ? 'filter-active' : ''}`}
            onClick={() => setFilterType(prev => (prev === 'ALL' ? 'PDF' : prev === 'PDF' ? 'JPEG' : prev === 'JPEG' ? 'Reviewed' : 'ALL'))}
            title="Filter by file type"
          >
            <Filter size={15} />
            <span>Filter: {filterType}</span>
          </button>

          <button 
            type="button" 
            className="btn btn-secondary sort-btn"
            onClick={() => setSortOrder(prev => (prev === 'newest' ? 'oldest' : prev === 'oldest' ? 'name' : 'newest'))}
            title="Toggle sort order"
          >
            <ArrowUpDown size={15} />
            <span>Sort: {sortOrder}</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary upload-trigger-btn"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={16} />
            <span>Upload File</span>
          </button>
        </div>
      </header>

      <div className="search-bar-wrapper">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search files, dates, or keywords..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
            <X size={16} />
          </button>
        )}
      </div>

      <div className="files-layout-grid">
        <section className="documents-list-section">
          {filteredFiles.length === 0 ? (
            <div className="empty-files-state card">
              <FileText size={40} color="#94a3b8" />
              <h4>No files found</h4>
              <p>Try searching for a different term or upload a new health document.</p>
            </div>
          ) : (
            filteredFiles.map(file => {
              const isSelected = activeDoc?.id === file.id;
              return (
                <div
                  key={file.id}
                  className={`document-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedFile(file)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="doc-icon-box">
                    {getFileIcon(file.iconType)}
                  </div>

                  <div className="doc-content">
                    <div className="doc-header-row">
                      <h3 className="doc-name">{file.name}</h3>
                      <span className="doc-date">{file.date}</span>
                    </div>

                    <p className="doc-provider">{file.provider}</p>

                    <div className="doc-tags-row">
                      {file.status && (
                        <span className={`badge ${file.status === 'Reviewed' || file.status === 'Verified' ? 'badge-success' : 'badge-neutral'}`}>
                          {file.status}
                        </span>
                      )}
                      <span className="doc-type-badge">{file.type} ({file.size})</span>
                      
                      <button 
                        className="quick-preview-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file);
                          setShowPreviewModal(true);
                        }}
                        title="Preview Document"
                      >
                        <Eye size={13} />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        <aside className="ai-summary-column">
          {activeDoc ? (
            <div className="ai-summary-card">
              <div className="ai-summary-header">
                <div className="summary-title-badge">
                  <Sparkles size={18} className="summary-sparkle-icon" />
                  <h3 className="summary-title">AI Summary</h3>
                </div>
                <button 
                  className="download-summary-icon-btn" 
                  title="Download Summary Report"
                  onClick={() => handleDownload(activeDoc)}
                >
                  <Download size={16} />
                </button>
              </div>

              <div className="overview-block">
                <span className="overview-label">DOCUMENT OVERVIEW</span>
                <p className="overview-text">{activeDoc.aiSummary?.overview}</p>
              </div>

              <div className="observations-block">
                <span className="overview-label">KEY OBSERVATIONS</span>
                <div className="observations-list">
                  {activeDoc.aiSummary?.keyObservations?.map(obs => (
                    <div key={obs.id} className="observation-card">
                      <div className="obs-header-row">
                        <div className="obs-label-group">
                          <div className="obs-bullet-circle">
                            <Droplet size={13} />
                          </div>
                          <span className="obs-name">{obs.label}</span>
                        </div>
                        <span className={`obs-status-chip ${obs.status === 'Elevated' ? 'status-elevated' : 'status-normal'}`}>
                          {obs.status}
                        </span>
                      </div>

                      <div className="obs-values-row">
                        <span className="obs-main-val">{obs.value}</span>
                        <span className="obs-ref-val">({obs.reference})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ai-disclaimer-box">
                <AlertTriangle size={13} />
                <span>{activeDoc.aiSummary?.disclaimer}</span>
              </div>
            </div>
          ) : (
            <div className="ai-summary-empty card">
              <Sparkles size={32} color="#94a3b8" />
              <p>Select a document to review the AI-assisted summary.</p>
            </div>
          )}
        </aside>
      </div>

      {showUploadModal && createPortal(
        <div className="modal-backdrop" onClick={() => !isUploading && setShowUploadModal(false)}>
          <div className="modal-content card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Medical Document</h3>
              {!isUploading && (
                <button className="modal-close-btn" type="button" onClick={() => setShowUploadModal(false)}>✕</button>
              )}
            </div>

            <form onSubmit={handleUploadSubmit} className="upload-modal-body">
              <div className="dropzone-area" style={{ position: 'relative' }}>
                <input 
                  type="file" 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  onChange={(e) => setSelectedUploadFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Upload size={32} className="dropzone-icon" />
                <p className="dropzone-text">
                  {selectedUploadFile ? selectedUploadFile.name : "Drag & drop your health document here, or click to browse"}
                </p>
                <span className="dropzone-hint">Supports PDF, JPEG, PNG (up to 25MB)</span>
              </div>

              <div className="modal-form-group">
                <label>Document Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Metabolic Blood Test 2026"
                  value={uploadFileName}
                  onChange={e => setUploadFileName(e.target.value)}
                  className="modal-input"
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Provider / Facility</label>
                <input 
                  type="text" 
                  placeholder="e.g. Quest Diagnostics, Seattle General"
                  value={uploadProvider}
                  onChange={e => setUploadProvider(e.target.value)}
                  className="modal-input"
                />
              </div>

              <div className="modal-form-group">
                <label>Format</label>
                <select 
                  value={uploadFileType} 
                  onChange={e => setUploadFileType(e.target.value)}
                  className="modal-input"
                >
                  <option value="PDF">PDF</option>
                  <option value="JPEG">JPEG</option>
                  <option value="PNG">PNG</option>
                </select>
              </div>

              {isUploading && (
                <div className="upload-progress-container">
                  <div className="upload-progress-bar">
                    <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span className="upload-progress-text">Uploading and processing... {uploadProgress}%</span>
                </div>
              )}

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isUploading || (!selectedUploadFile && !uploadFileName.trim())}
                >
                  {isUploading ? 'Uploading...' : 'Confirm Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showPreviewModal && activeDoc && createPortal(
        <div className="modal-backdrop" onClick={() => setShowPreviewModal(false)}>
          <div className="modal-content preview-modal-card card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="preview-title-info">
                <h3>{activeDoc.name}</h3>
                <span className="preview-sub">{activeDoc.provider} • {activeDoc.date}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowPreviewModal(false)}>✕</button>
            </div>

            <div className="preview-body">
              <div className="synthetic-doc-viewer">
                <div className="doc-paper-header">
                  <h4>OFFICIAL CLINICAL RECORD</h4>
                  <span>CarePath Verified • Secure Health Record</span>
                </div>
                <div className="doc-paper-content">
                  <h5>{activeDoc.name}</h5>
                  <p><strong>Category:</strong> {activeDoc.type} Document</p>
                  <p><strong>Patient ID:</strong> {activeDoc.patient_id}</p>
                  <p><strong>Clinical Notes:</strong> {activeDoc.description}</p>
                </div>
              </div>

              <div className="preview-summary-sidebar">
                <div className="ai-summary-badge">
                  <Sparkles size={16} />
                  <span>AI Extracted Overview</span>
                </div>
                <p className="summary-overview-text">{activeDoc.aiSummary?.overview || 'Document analyzed successfully.'}</p>
                <div className="observations-list">
                  {activeDoc.aiSummary?.keyObservations?.map(obs => (
                    <div key={obs.id} className="obs-item">
                      <span className="obs-label">{obs.label}</span>
                      <span className="obs-val">{obs.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={() => {
                  deleteMedicalFile(activeDoc.id);
                  setShowPreviewModal(false);
                }}
              >
                <Trash2 size={14} />
                <span>Delete File</span>
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => setShowPreviewModal(false)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
