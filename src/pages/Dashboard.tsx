
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                <Wallet className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">Deriv Payment Agent</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile?.full_name || user?.email}
          </h1>
          <p className="text-gray-600">
            Here's your payment processing activity overview for today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Client Transactions
                <Button variant="outline" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No transactions yet. Start by adding clients and processing transactions.</p>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.transaction_type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.transaction_type === 'deposit' ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.clients?.full_name || 'Unknown Client'}</p>
                          <p className="text-sm text-gray-500">{new Date(transaction.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
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
                className="w-full bg-blue-600 hover:bg-blue-700"
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
        </div>

        {/* API Integration Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Deriv API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Payment API Connection Active</p>
                  <p className="text-sm text-gray-600">Connected to api.deriv.com</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
