import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FileText, Users, Calculator, Building, Download, Plus, Search } from 'lucide-react';

interface Request {
  id: string;
  type: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  amount?: number;
  recipient?: string;
}

const RequestManagement = () => {
  const [activeTab, setActiveTab] = useState('conference');
  const [searchTerm, setSearchTerm] = useState('');

  // Editable conference request data
  const [conferenceRequest, setConferenceRequest] = useState({
    ref: 'OUK/ICT/REQ/187',
    date: '9th April 2026',
    recipient: 'Vice-Chancellor',
    throughRecipient: 'Deputy Vice-Chancellor, Planning & Infrastructure',
    venue: 'The Cradle, Silicon Savanna, Konza Technopolis',
    phone: '020 000211/2',
    website: 'https://ouk.ac.ke',
    workshopDates: 'April 20th to May 3rd 2026',
    participants: '78',
    requirements: [
      'Venue equipped with reliable internet access',
      'Full suite of audiovisual equipment',
      'Dedicated breakout spaces to facilitate training sessions',
      'Debriefings and quality reviews'
    ]
  });

  // Sample requests data
  const requests: Request[] = [
    {
      id: 'REQ-001',
      type: 'conference',
      title: 'REQUEST FOR CONFERENCE FACILITY AND MEALS - 4.1 DIGITISATION',
      status: 'pending',
      date: '2026-04-09',
      recipient: 'Vice-Chancellor'
    },
    {
      id: 'REQ-002', 
      type: 'digitisation',
      title: 'CONTENT DIGITISATION FOR 4.1 SEMESTER COURSES',
      status: 'approved',
      date: '2026-04-09',
      amount: 17565100,
      recipient: 'Vice-Chancellor'
    }
  ];

  const courses = [
    { code: 'ECO 403', title: 'Applied Econometrics', programme: 'BE01' },
    { code: 'ECO 405', title: 'Behavioural and Institutional Economics', programme: 'BE01' },
    { code: 'ECO 400', title: 'Research Project', programme: 'BE01' },
    { code: 'ECO 401', title: 'Environmental and Natural Resource Economics', programme: 'BE01' },
    { code: 'SST 401', title: 'Time Series Analysis', programme: 'BE01' },
    { code: 'BEB 401', title: 'Operations Research', programme: 'BE02' },
    { code: 'BEB 403', title: 'Design Thinking', programme: 'BE02' },
    { code: 'BEB 405', title: 'Taxation', programme: 'BE02' },
    { code: 'BEB 407', title: 'Strategic Management', programme: 'BE02' },
    { code: 'BEB 409', title: 'Global Business Management', programme: 'BE02' }
  ];

  const financialData = [
    { name: 'Alfred Muriu', role: 'Technical Digitizer', rate: 8300, days: 14, dsa: 116200 },
    { name: 'Charles Irungu', role: 'Technical Digitizer', rate: 8300, days: 14, dsa: 116200 },
    { name: 'Duncan Kiprotich', role: 'Technical Digitizer', rate: 8300, days: 14, dsa: 116200 },
    { name: 'Evans Abuga', role: 'Technical Digitizer', rate: 8300, days: 14, dsa: 116200 },
    { name: 'Farid Muigu', role: 'Technical Digitizer', rate: 8300, days: 14, dsa: 116200 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Request Management</h1>
          <p className="text-muted-foreground">Manage digitisation requests and approvals</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search requests..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conference" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Conference
          </TabsTrigger>
          <TabsTrigger value="digitisation" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Digitisation
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Financial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conference" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                REQUEST FOR CONFERENCE FACILITY AND MEALS - 4.1 DIGITISATION
              </CardTitle>
              <CardDescription>
                Conference facilities and meals request for digitisation workshop
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* OUK Logo and Header */}
              <div className="text-center mb-6">
                <img 
                  src="https://ouk.ac.ke/sites/default/files/gallery/logo_footer.png" 
                  alt="OUK Logo" 
                  className="h-16 mx-auto mb-4"
                />
                <div className="text-center">
                  <h3 className="font-bold text-lg">DIRECTORATE of INFORMATION & COMMUNICATIONS TECHNOLOGY</h3>
                  <p className="text-sm text-muted-foreground">REF: {conferenceRequest.ref}</p>
                  <p className="text-sm">{conferenceRequest.date}</p>
                </div>
              </div>

              {/* Letter Content */}
              <div className="space-y-4 border-l-4 border-primary pl-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">To</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={conferenceRequest.recipient}
                      onChange={(e) => setConferenceRequest({...conferenceRequest, recipient: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Through</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={conferenceRequest.throughRecipient}
                      onChange={(e) => setConferenceRequest({...conferenceRequest, throughRecipient: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Venue</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={conferenceRequest.venue}
                      onChange={(e) => setConferenceRequest({...conferenceRequest, venue: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={conferenceRequest.phone}
                      onChange={(e) => setConferenceRequest({...conferenceRequest, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Workshop Dates</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={conferenceRequest.workshopDates}
                    onChange={(e) => setConferenceRequest({...conferenceRequest, workshopDates: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Participants</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={conferenceRequest.participants}
                    onChange={(e) => setConferenceRequest({...conferenceRequest, participants: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Website</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={conferenceRequest.website}
                    onChange={(e) => setConferenceRequest({...conferenceRequest, website: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Requirements</label>
                  <textarea
                    className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    value={conferenceRequest.requirements.join('\n')}
                    onChange={(e) => setConferenceRequest({...conferenceRequest, requirements: e.target.value.split('\n')})}
                  />
                </div>
              </div>

              {/* Letter Body */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm leading-relaxed">
                  I am writing to formally request conference facilities and meals for upcoming Content Digitisation workshop for 4.1 Semester Courses, scheduled between {conferenceRequest.workshopDates}. This {conferenceRequest.participants} day workshop will host {conferenceRequest.participants} participants, and we require a venue equipped with reliable internet access, a full suite of audiovisual equipment, and dedicated breakout spaces to facilitate training sessions, debriefings, and quality reviews.
                </p>
                <p className="text-sm mt-4">I look forward to your consideration.</p>
                <p className="text-sm mt-2 font-semibold">Sincerely,</p>
                <p className="text-sm mt-1">Mr Amos Wanyoike | Ag. Director ICT</p>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Badge className={getStatusColor('pending')}>Pending</Badge>
                <span className="text-sm text-muted-foreground">Awaiting VC approval</span>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
                <Button>Save Changes</Button>
                <Button variant="secondary">Submit Request</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="digitisation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                CONTENT DIGITISATION FOR 4.1 SEMESTER COURSES
              </CardTitle>
              <CardDescription>
                Request for approval to proceed with digitisation of 78 undergraduate courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reference</label>
                  <p className="font-semibold">OUK/ICT/REQ/188</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="font-semibold">9th April 2026</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Workshop Duration</label>
                  <p className="font-semibold">April 20th to May 3rd 2026 (14 days)</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Cost</label>
                  <p className="font-semibold">KES 17,565,100</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Project Details</label>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>78 undergraduate courses for 4.1 Semester</li>
                  <li>Dedicated team of supervised digitisers</li>
                  <li>Daily deployment for course material conversion</li>
                  <li>Quality standards and target achievement focus</li>
                  <li>Detailed outline with assigned digitisers attached</li>
                </ul>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getStatusColor('approved')}>Approved</Badge>
                <span className="text-sm text-muted-foreground">Approved by VC</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
                <Button>View Full Letter</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                LIST OF COURSES TO BE DIGITISED - 4TH YEAR SEMESTER 1
              </CardTitle>
              <CardDescription>
                Complete list of 78 courses scheduled for digitisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Total Courses:</span>
                    <Badge variant="secondary">78</Badge>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">#</th>
                        <th className="text-left p-2">Course Code</th>
                        <th className="text-left p-2">Course Title</th>
                        <th className="text-left p-2">Programme</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course, index) => (
                        <tr key={index} className="border-b border-border hover:bg-muted/50">
                          <td className="p-2">{index + 1}</td>
                          <td className="p-2 font-mono">{course.code}</td>
                          <td className="p-2">{course.title}</td>
                          <td className="p-2">
                            <Badge variant="outline">{course.programme}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-sm text-muted-foreground">
                  Showing 10 of 78 courses. Export to view complete list.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                FINANCIAL COSTING
              </CardTitle>
              <CardDescription>
                Detailed breakdown of digitisation project costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">78</div>
                    <div className="text-sm text-muted-foreground">Total Participants</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">14</div>
                    <div className="text-sm text-muted-foreground">Workshop Days</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">KES 17.6M</div>
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold mb-2">External Digitisers (Sample)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Role</th>
                        <th className="text-right p-2">DSA Rate (KES)</th>
                        <th className="text-right p-2">Days</th>
                        <th className="text-right p-2">DSA (KES)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData.map((person, index) => (
                        <tr key={index} className="border-b border-border hover:bg-muted/50">
                          <td className="p-2">{person.name}</td>
                          <td className="p-2">{person.role}</td>
                          <td className="p-2 text-right">{person.rate.toLocaleString()}</td>
                          <td className="p-2 text-right">{person.days}</td>
                          <td className="p-2 text-right font-semibold">{person.dsa.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>External Digitisers Sub Total:</span>
                  <span className="font-semibold">KES 8,443,400</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Internal Staff Sub Total:</span>
                  <span className="font-semibold">KES 5,219,900</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Conference Facility:</span>
                  <span className="font-semibold">KES 3,990,000</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Grand Total:</span>
                  <span className="text-primary">KES 17,653,300</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Full Report
                </Button>
                <Button>Generate Invoice</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestManagement;
