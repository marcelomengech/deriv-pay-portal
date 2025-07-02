
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  Bell,
  Settings,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: "Total Balance",
      value: "$12,345.67",
      change: "+2.5%",
      icon: Wallet,
      color: "text-green-600"
    },
    {
      title: "Active Clients",
      value: "127",
      change: "+12",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Today's Volume",
      value: "$8,921.00",
      change: "+15.3%",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Commission",
      value: "$234.56",
      change: "+8.2%",
      icon: DollarSign,
      color: "text-orange-600"
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      type: "deposit",
      client: "John Smith",
      amount: "+$500.00",
      status: "completed",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "withdrawal",
      client: "Sarah Johnson",
      amount: "-$250.00",
      status: "pending",
      time: "4 hours ago"
    },
    {
      id: 3,
      type: "deposit",
      client: "Mike Wilson",
      amount: "+$1,200.00",
      status: "completed",
      time: "6 hours ago"
    }
  ];

  const handleLogout = () => {
    navigate('/');
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
              <span className="text-xl font-bold text-gray-900">DerivPay Agent</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
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
            Welcome back, Agent
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your payment agent business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
                Recent Transactions
                <Button variant="outline" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.client}</p>
                        <p className="text-sm text-gray-500">{transaction.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount}
                      </p>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Process Payment
              </Button>
              <Button variant="outline" className="w-full">
                Add New Client
              </Button>
              <Button variant="outline" className="w-full">
                Generate Report
              </Button>
              <Button variant="outline" className="w-full">
                API Settings
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
                  <p className="font-medium text-gray-900">API Connection Active</p>
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
