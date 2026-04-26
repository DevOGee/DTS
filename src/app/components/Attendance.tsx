import { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, XCircle, Download, UserCheck, X, Save, QrCode, RefreshCw } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Group } from '../data/mockData';

export function Attendance() {
  const { user } = useAuth();
  const { groups, participants, attendance, workshop, toggleAttendance, markAttendanceDayPresent } = useData();
  const { success, info } = useToast();
  const [selectedDay, setSelectedDay] = useState(1);
  const [filterGroup, setFilterGroup] = useState<Group | 'all'>('all');
  const [editingNote, setEditingNote] = useState<{ pid: string; day: number } | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  
  // QR Code state
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrCodeExpiry, setQrCodeExpiry] = useState<Date>(new Date());
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  
  // Multi-day QR code state
  const [qrCodes, setQrCodes] = useState<Map<number, string>>(new Map());
  const [qrCodesExpiry, setQrCodesExpiry] = useState<Map<number, Date>>(new Map());
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number }>({ start: 1, end: 1 });
  const [viewMode, setViewMode] = useState<'single' | 'range' | 'all'>('single');

  const canMark = (g: Group) => user?.role === 'System Admin' || user?.role === 'Programme Lead' || (user?.role === 'Group Leader' && user.group === g);
  const canMarkAll = user?.role === 'System Admin' || user?.role === 'Programme Lead';

  const filteredParts = useMemo(() =>
    participants.filter(p => filterGroup === 'all' || p.group === filterGroup), [participants, filterGroup]);

  // Pagination logic
  const paginatedParts = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return filteredParts.slice(startIndex, endIndex);
  }, [filteredParts, currentPage]);

  const totalPages = Math.ceil(filteredParts.length / recordsPerPage);

  // Reset page when filter changes
  useMemo(() => {
    setCurrentPage(1);
  }, [filterGroup]);

  // QR Code generation with daily expiration
  const generateQRCode = async (day?: number) => {
    const targetDay = day || selectedDay;
    setIsGeneratingQR(true);
    
    try {
      // Set expiry to end of current day
      const today = new Date();
      const expiry = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      // Create registration URL with day and expiry information
      const registrationData = {
        workshopId: workshop.id,
        day: targetDay,
        date: today.toISOString().split('T')[0],
        expires: expiry.toISOString(),
        type: 'attendance-registration'
      };
      
      const registrationUrl = `${window.location.origin}/register?data=${btoa(JSON.stringify(registrationData))}`;
      
      // Generate QR code
      const qrCodeDataUrl = await QRCodeLib.toDataURL(registrationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#037b90',
          light: '#ffffff'
        }
      });
      
      if (day === undefined) {
        // Single day mode
        setQrCodeUrl(qrCodeDataUrl);
        setQrCodeExpiry(expiry);
      } else {
        // Multi-day mode
        setQrCodes(prev => new Map(prev.set(day, qrCodeDataUrl)));
        setQrCodesExpiry(prev => new Map(prev.set(day, expiry)));
      }
      
      success(`QR code for Day ${targetDay} generated successfully! Expires at end of day.`, 'QR Code Ready');
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      info('Failed to generate QR code. Please try again.', 'Error');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Generate QR codes for a range of days
  const generateRangeQRCode = async () => {
    setIsGeneratingQR(true);
    
    try {
      const today = new Date();
      const expiry = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      for (let day = selectedRange.start; day <= selectedRange.end; day++) {
        const registrationData = {
          workshopId: workshop.id,
          day: day,
          date: today.toISOString().split('T')[0],
          expires: expiry.toISOString(),
          type: 'attendance-registration'
        };
        
        const registrationUrl = `${window.location.origin}/register?data=${btoa(JSON.stringify(registrationData))}`;
        
        const qrCodeDataUrl = await QRCodeLib.toDataURL(registrationUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#037b90',
            light: '#ffffff'
          }
        });
        
        setQrCodes(prev => new Map(prev.set(day, qrCodeDataUrl)));
        setQrCodesExpiry(prev => new Map(prev.set(day, expiry)));
      }
      
      success(`QR codes for Days ${selectedRange.start}-${selectedRange.end} generated successfully!`, 'Range QR Codes Ready');
    } catch (error) {
      console.error('Failed to generate range QR codes:', error);
      info('Failed to generate QR codes. Please try again.', 'Error');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Generate QR codes for all days
  const generateAllQRCode = async () => {
    setIsGeneratingQR(true);
    
    try {
      const today = new Date();
      const expiry = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      for (let day = 1; day <= workshop.numberOfDays; day++) {
        const registrationData = {
          workshopId: workshop.id,
          day: day,
          date: today.toISOString().split('T')[0],
          expires: expiry.toISOString(),
          type: 'attendance-registration'
        };
        
        const registrationUrl = `${window.location.origin}/register?data=${btoa(JSON.stringify(registrationData))}`;
        
        const qrCodeDataUrl = await QRCodeLib.toDataURL(registrationUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#037b90',
            light: '#ffffff'
          }
        });
        
        setQrCodes(prev => new Map(prev.set(day, qrCodeDataUrl)));
        setQrCodesExpiry(prev => new Map(prev.set(day, expiry)));
      }
      
      success(`QR codes for all ${workshop.numberOfDays} days generated successfully!`, 'All QR Codes Ready');
    } catch (error) {
      console.error('Failed to generate all QR codes:', error);
      info('Failed to generate QR codes. Please try again.', 'Error');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Check if QR code has expired
  const isQRCodeExpired = () => {
    return new Date() > qrCodeExpiry;
  };

  // Auto-generate QR code when day changes
  useEffect(() => {
    generateQRCode();
  }, [selectedDay]);

  const getRecord = (pid: string, day: number) => attendance.find(a => a.participantId === pid && a.day === day);

  const dayStats = useMemo(() => Array.from({ length: workshop.numberOfDays }, (_, i) => {
    const day = i + 1;
    const recs = attendance.filter(a => a.day === day);
    const present = recs.filter(a => a.status === 'Present').length;
    return { day, present, total: recs.length, pct: recs.length ? Math.round(present / recs.length * 100) : 0 };
  }), [attendance, workshop.numberOfDays]);

  const overallPct = (pid: string) => {
    const recs = attendance.filter(a => a.participantId === pid);
    return recs.length ? Math.round(recs.filter(a => a.status === 'Present').length / recs.length * 100) : 0;
  };

  const cur = dayStats[selectedDay - 1];
  const overallPresent = attendance.filter(a => a.status === 'Present').length;
  const overallTotal = attendance.length;
  const overallRate = overallTotal ? Math.round(overallPresent / overallTotal * 100) : 0;

  const exportCSV = () => {
    const days = Array.from({ length: workshop.numberOfDays }, (_, i) => `Day ${i + 1}`);
    const rows = participants.map(p => [
      p.name, `Group ${p.group}`,
      ...days.map((_, i) => attendance.find(a => a.participantId === p.id && a.day === i + 1)?.status === 'Present' ? 'P' : 'A'),
      `${overallPct(p.id)}%`,
    ]);
    const csv = [['Name', 'Group', ...days, 'Overall %'], ...rows].map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'attendance.csv'; a.click();
    URL.revokeObjectURL(url);
    success(`Attendance exported — ${participants.length} participant(s), ${workshop.numberOfDays} day(s).`, 'Export Complete');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-1">Attendance Tracking</h1>
          <p className="text-muted-foreground text-sm">Mark and monitor daily participant attendance</p>
        </div>
        <button onClick={exportCSV} className="btn btn-muted"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      {/* QR Code Section */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <QrCode className="w-6 h-6 text-[#037b90]" />
            <div>
              <h2 className="text-lg font-semibold">Attendance QR Codes</h2>
              <p className="text-sm text-muted-foreground">Generate QR codes for attendance registration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => generateQRCode()}
              disabled={isGeneratingQR}
              className="btn btn-secondary btn-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingQR ? 'animate-spin' : ''}`} />
              {isGeneratingQR ? 'Generating...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-2 mb-6 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">View Mode:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'single' 
                  ? 'bg-[#037b90] text-white' 
                  : 'bg-background border border-border hover:bg-muted'
              }`}
            >
              Single Day
            </button>
            <button
              onClick={() => setViewMode('range')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'range' 
                  ? 'bg-[#037b90] text-white' 
                  : 'bg-background border border-border hover:bg-muted'
              }`}
            >
              Day Range
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'all' 
                  ? 'bg-[#037b90] text-white' 
                  : 'bg-background border border-border hover:bg-muted'
              }`}
            >
              All Days
            </button>
          </div>
        </div>

        {/* Range Selector */}
        {viewMode === 'range' && (
          <div className="mb-6 p-4 border border-border rounded-lg bg-muted/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">From:</label>
                <select 
                  value={selectedRange.start} 
                  onChange={(e) => setSelectedRange(prev => ({ ...prev, start: parseInt(e.target.value) }))}
                  className="field w-20"
                >
                  {Array.from({ length: workshop.numberOfDays }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">To:</label>
                <select 
                  value={selectedRange.end} 
                  onChange={(e) => setSelectedRange(prev => ({ ...prev, end: parseInt(e.target.value) }))}
                  className="field w-20"
                >
                  {Array.from({ length: workshop.numberOfDays }, (_, i) => (
                    <option key={i + 1} value={i + 1} disabled={i + 1 < selectedRange.start}>
                      Day {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                onClick={generateRangeQRCode}
                disabled={isGeneratingQR || selectedRange.start > selectedRange.end}
                className="btn btn-primary btn-sm"
              >
                Generate Range
              </button>
            </div>
          </div>
        )}

        {/* All Days Generator */}
        {viewMode === 'all' && (
          <div className="mb-6 p-4 border border-border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Generate QR Codes for All Days</h3>
                <p className="text-sm text-muted-foreground">Create QR codes for all {workshop.numberOfDays} workshop days</p>
              </div>
              <button 
                onClick={generateAllQRCode}
                disabled={isGeneratingQR}
                className="btn btn-primary"
              >
                {isGeneratingQR ? 'Generating...' : 'Generate All Days'}
              </button>
            </div>
          </div>
        )}
        
        {/* Creative QR Code Display */}
        <div className="space-y-6">
          {viewMode === 'single' && (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                {qrCodeUrl ? (
                  <>
                    <img 
                      src={qrCodeUrl} 
                      alt="Attendance QR Code" 
                      className={`w-48 h-48 rounded-lg border-2 border-border ${isQRCodeExpired() ? 'opacity-50 grayscale' : ''}`}
                    />
                    {isQRCodeExpired() && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                        <div className="text-center text-white p-4">
                          <X className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm font-medium">Expired</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-48 h-48 rounded-lg border-2 border-border flex items-center justify-center bg-muted">
                    <div className="text-center text-muted-foreground">
                      <QrCode className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Generating QR...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Workshop:</span>
                    <p className="font-semibold">{workshop.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Day:</span>
                    <p className="font-semibold">{selectedDay} of {workshop.numberOfDays}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <p className={`font-semibold ${isQRCodeExpired() ? 'text-red-600' : 'text-green-600'}`}>
                      {isQRCodeExpired() ? 'Expired' : 'Active'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Expires:</span>
                    <p className="font-semibold">{qrCodeExpiry.toLocaleTimeString()}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Instructions:</strong> Participants can scan this QR code to register their attendance for Day {selectedDay}. 
                    The code expires automatically at the end of the day (11:59 PM).
                  </p>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'range' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium text-lg mb-2">Days {selectedRange.start} - {selectedRange.end}</h3>
                <p className="text-sm text-muted-foreground">QR codes for selected day range</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: selectedRange.end - selectedRange.start + 1 }, (_, i) => {
                  const day = selectedRange.start + i;
                  const qrCode = qrCodes.get(day);
                  const expiry = qrCodesExpiry.get(day);
                  const isExpired = expiry ? new Date() > expiry : false;
                  
                  return (
                    <div key={day} className="text-center">
                      <div className="relative mb-2">
                        {qrCode ? (
                          <>
                            <img 
                              src={qrCode} 
                              alt={`Day ${day} QR Code`} 
                              className={`w-24 h-24 rounded-lg border border-border mx-auto ${isExpired ? 'opacity-50 grayscale' : ''}`}
                            />
                            {isExpired && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                                <X className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-24 h-24 rounded-lg border border-border flex items-center justify-center bg-muted mx-auto">
                            <QrCode className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs">
                        <p className="font-medium">Day {day}</p>
                        <p className={`text-xs ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                          {isExpired ? 'Expired' : 'Active'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'all' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium text-lg mb-2">All {workshop.numberOfDays} Workshop Days</h3>
                <p className="text-sm text-muted-foreground">Complete QR code collection for the entire workshop</p>
              </div>
              
              {/* Creative Timeline Display */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#037b90] to-[#ff7f50]"></div>
                
                {/* Day Cards */}
                <div className="space-y-4">
                  {Array.from({ length: workshop.numberOfDays }, (_, i) => {
                    const day = i + 1;
                    const qrCode = qrCodes.get(day);
                    const expiry = qrCodesExpiry.get(day);
                    const isExpired = expiry ? new Date() > expiry : false;
                    const isCurrentDay = day === selectedDay;
                    
                    return (
                      <div key={day} className={`flex items-center gap-4 ${isCurrentDay ? 'bg-gradient-to-r from-[#037b90]/10 to-[#ff7f50]/10 p-4 rounded-xl' : 'p-4'}`}>
                        {/* Day Indicator */}
                        <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCurrentDay 
                            ? 'bg-gradient-to-br from-[#037b90] to-[#ff7f50] text-white shadow-lg' 
                            : 'bg-background border-2 border-[#037b90] text-[#037b90]'
                        }`}>
                          Day {day}
                        </div>
                        
                        {/* QR Code and Info */}
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {qrCode ? (
                              <>
                                <img 
                                  src={qrCode} 
                                  alt={`Day ${day} QR Code`} 
                                  className={`w-16 h-16 rounded-lg border border-border ${isExpired ? 'opacity-50 grayscale' : ''}`}
                                />
                                {isExpired && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                                    <X className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="w-16 h-16 rounded-lg border border-border flex items-center justify-center bg-muted">
                                <QrCode className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            
                            <div>
                              <p className="font-medium">Day {day} Attendance</p>
                              <p className="text-sm text-muted-foreground">
                                {isExpired ? 'Expired' : 'Active'} • {expiry ? `Expires: ${expiry.toLocaleTimeString()}` : 'Not generated'}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => generateQRCode(day)}
                            className="btn btn-secondary btn-xs"
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Rate', value: `${overallRate}%`, sub: `${overallPresent}/${overallTotal} records`, color: 'text-chart-3', bg: 'bg-chart-3/10' },
          { label: 'Day Rate', value: `${cur?.pct ?? 0}%`, sub: `Day ${selectedDay}: ${cur?.present}/${cur?.total}`, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Participants', value: participants.length, sub: `${groups.length} groups`, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Workshop Days', value: workshop.numberOfDays, sub: 'Total days', color: 'text-chart-4', bg: 'bg-chart-4/10' },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl p-5 border border-border card-hover">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <UserCheck className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`stat-number ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Day picker */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-base font-semibold">Select Day</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <select className="field sm:w-36" value={filterGroup} onChange={e => setFilterGroup(e.target.value as any)}>
              <option value="all">All Groups</option>
              {groups.map(g => <option key={g} value={g}>Group {g}</option>)}
            </select>
            {canMarkAll && (
              <button onClick={() => {
                markAttendanceDayPresent(selectedDay, filterGroup);
                info(
                  `All ${filterGroup === 'all' ? '' : `Group ${filterGroup} `}participants marked Present for Day ${selectedDay}.`,
                  'Attendance Marked'
                );
              }} className="btn btn-secondary btn-sm">
                ✓ Mark All Present
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dayStats.map(({ day, pct, present, total }) => (
            <button key={day} onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 text-center transition-all min-w-[72px] ${
                selectedDay === day
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-background border-border hover:border-primary/50'
              }`}>
              <div className="text-xs mb-1 font-medium">Day {day}</div>
              <div className="text-xl font-bold leading-none">{pct}%</div>
              <div className="text-[10px] mt-1 opacity-70">{present}/{total}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Attendance table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Day {selectedDay} · {cur?.present ?? 0} Present / {cur?.total ?? 0} Participants</h2>
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Name', 'Group', 'Role', `Day ${selectedDay}`, 'Overall', 'All Days'].map(h => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${h === `Day ${selectedDay}` || h === 'Overall' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedParts.map(p => {
                const rec = getRecord(p.id, selectedDay);
                const present = rec?.status === 'Present';
                const pct = overallPct(p.id);
                const allDays = Array.from({ length: workshop.numberOfDays }, (_, i) => {
                  const r = getRecord(p.id, i + 1);
                  return r?.status === 'Present';
                });
                return (
                  <tr key={p.id} className="table-row-hover transition-colors">
                    <td className="py-3.5 px-4 font-medium">{p.name}</td>
                    <td className="py-3.5 px-4"><span className="badge badge-primary">Group {p.group}</span></td>
                    <td className="py-3.5 px-4 text-muted-foreground text-xs">{p.role}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => canMark(p.group) && toggleAttendance(p.id, selectedDay)}
                        disabled={!canMark(p.group)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          present ? 'bg-chart-3/10 text-chart-3 hover:bg-chart-3/20' : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                        } ${!canMark(p.group) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        {present ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {present ? 'Present' : 'Absent'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 75 ? 'bg-chart-3' : pct >= 50 ? 'bg-chart-4' : 'bg-destructive'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-0.5">
                        {allDays.map((isP, i) => (
                          <div key={i} title={`Day ${i + 1}: ${isP ? 'Present' : 'Absent'}`}
                            className={`w-4 h-4 rounded-sm ${i + 1 === selectedDay ? 'ring-2 ring-primary' : ''} ${isP ? 'bg-chart-3' : 'bg-destructive/30'}`} />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border">
          {paginatedParts.map(p => {
            const rec = getRecord(p.id, selectedDay);
            const present = rec?.status === 'Present';
            const pct = overallPct(p.id);
            return (
              <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-primary text-xs">Group {p.group}</span>
                    <span className="text-xs text-muted-foreground">{pct}% overall</span>
                  </div>
                </div>
                <button
                  onClick={() => canMark(p.group) && toggleAttendance(p.id, selectedDay)}
                  disabled={!canMark(p.group)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    present ? 'bg-chart-3/10 text-chart-3' : 'bg-destructive/10 text-destructive'
                  } disabled:opacity-50`}>
                  {present ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {present ? 'Present' : 'Absent'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
          Showing {((currentPage - 1) * recordsPerPage) + 1}-{Math.min(currentPage * recordsPerPage, filteredParts.length)} of {filteredParts.length} participants{filterGroup !== 'all' ? ` in Group ${filterGroup}` : ''}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-muted'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
