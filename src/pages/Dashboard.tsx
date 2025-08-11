
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  CreditCard, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  Bell,
  Settings,
  LogOut,
  Plus,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    todayTransactions: 0,
    totalAmount: 0,
    pendingTransactions: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchClients();
      fetchTransactions();
      fetchStats();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchClients = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching clients:', error);
      } else {
        setClients(data || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients:client_id (full_name)
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      // Get client count
      const { count: clientCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', user.id);

      // Get today's transactions
      const today = new Date().toISOString().split('T')[0];
      const { data: todayTransactions, error: transError } = await supabase
        .from('transactions')
        .select('amount, status')
        .eq('agent_id', user.id)
        .gte('created_at', today);

      // Get pending transactions count
      const { count: pendingCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', user.id)
        .eq('status', 'pending');

      if (!transError) {
        const todayAmount = todayTransactions?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
        
        setStats({
          totalClients: clientCount || 0,
          todayTransactions: todayTransactions?.length || 0,
          totalAmount: todayAmount,
          pendingTransactions: pendingCount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const dashboardStats = [
    {
      title: "Active Clients",
      value: stats.totalClients.toString(),
      change: "+12",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Today's Transactions",
      value: stats.todayTransactions.toString(),
      change: `$${stats.totalAmount.toFixed(2)}`,
      icon: CreditCard,
      color: "text-purple-600"
    },
    {
      title: "Pending Transactions",
      value: stats.pendingTransactions.toString(),
      change: "Processing",
      icon: DollarSign,
      color: "text-orange-600"
    },
    {
      title: "Payment Status",
      value: "Online",
      change: "API Connected",
      icon: Wallet,
      color: "text-green-600"
    }
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleProcessDeposit = () => {
    navigate('/process-transaction?type=deposit');
  };

  const handleProcessWithdrawal = () => {
    navigate('/process-transaction?type=withdrawal');
  };

  const handleAddClient = () => {
    navigate('/add-client');
  };

  const handleGenerateReport = () => {
    toast({
      title: "Generate Report",
      description: "Report generation feature coming soon. Export transaction and client reports.",
    });
  };

  return (
    <>
      <SEO 
        title="Dashboard | Deriv Pay Portal" 
        description="Overview of clients and M-Pesa transactions." 
        canonical="/dashboard" 
      />

      <main className="container py-8">
        {/* Welcome Section */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
            Welcome back, {userProfile?.full_name || user?.email}
          </h1>
          <p className="text-muted-foreground">
            Here's your payment processing activity overview for today.
          </p>
        </header>

        {/* Stats Grid */}
        <section aria-labelledby="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, index) => (
              <Card key={index} className="transition-transform hover:scale-[1.01]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Client Transactions
                <Button variant="outline" size="sm" onClick={() => navigate('/process-transaction')}>View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No transactions yet. Start by adding clients and processing transactions.</p>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.transaction_type === 'deposit' ? 'bg-primary/10' : 'bg-destructive/10'
                        }`}>
                          {transaction.transaction_type === 'deposit' ? (
                            <ArrowDownLeft className="h-4 w-4 text-primary" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.clients?.full_name || 'Unknown Client'}</p>
                          <p className="text-sm text-muted-foreground">{new Date(transaction.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.transaction_type === 'deposit' ? 'text-primary' : 'text-destructive'
                        }`}>
                          {transaction.transaction_type === 'deposit' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                        </p>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full"
                onClick={handleProcessDeposit}
              >
                Process Deposit
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleProcessWithdrawal}
              >
                Process Withdrawal
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleAddClient}
              >
                Add New Client
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGenerateReport}
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* API Integration Status */}
        <section>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Deriv API Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-medium">Payment API Connection Active</p>
                    <p className="text-sm text-muted-foreground">Connected to api.deriv.com</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );

};

export default Dashboard;
