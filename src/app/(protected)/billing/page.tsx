'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Crown,
  Rocket,
  ArrowRight,
  Calendar,
  Receipt,
  Download,
  Settings,
  Info
} from 'lucide-react';

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'enterprise'>('pro');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Up to 3 projects',
        '5 AI queries per day',
        'Basic commit analysis',
        'Community support',
        '1 team member'
      ],
      icon: Rocket,
      color: 'from-gray-500 to-gray-600',
      buttonText: 'Current Plan',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'Best for professional developers',
      features: [
        'Unlimited projects',
        'Unlimited AI queries',
        'Advanced commit analysis',
        'Priority support',
        'Up to 10 team members',
        'Advanced analytics',
        'Custom integrations'
      ],
      icon: Zap,
      color: 'from-blue-500 to-purple-500',
      buttonText: 'Upgrade to Pro',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'per month',
      description: 'For large teams and organizations',
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'Dedicated support',
        'Custom AI models',
        'SSO & advanced security',
        'Custom SLA',
        'On-premise deployment'
      ],
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      buttonText: 'Contact Sales',
      popular: false
    }
  ];

  const invoices = [
    {
      id: 'INV-001',
      date: '2025-01-15',
      amount: '$29.00',
      status: 'paid',
      period: 'Jan 2025'
    },
    {
      id: 'INV-002',
      date: '2024-12-15',
      amount: '$29.00',
      status: 'paid',
      period: 'Dec 2024'
    },
    {
      id: 'INV-003',
      date: '2024-11-15',
      amount: '$29.00',
      status: 'paid',
      period: 'Nov 2024'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-transparent rounded-full blur-3xl floating" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-pink-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl floating-delayed" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-purple-500/15 via-pink-500/8 to-transparent rounded-full blur-3xl floating" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Billing & Subscription</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Select the perfect plan for your team and unlock the full power of GitAid
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card
                key={plan.id}
                className={`group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  plan.popular
                    ? 'border-2 border-blue-500/50 shadow-xl shadow-blue-500/20'
                    : 'border'
                } ${isSelected ? 'ring-2 ring-blue-500/50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}

                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-white mb-1">{plan.name}</CardTitle>
                      <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.price !== 'Custom' && (
                      <span className="text-gray-400 text-sm">/{plan.period}</span>
                    )}
                  </div>

                  <Button
                    className={`w-full h-12 font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg hover:shadow-xl'
                        : plan.id === 'free'
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.id === 'free' ? 'Current Plan' : plan.buttonText}
                  </Button>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Current Subscription Details */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-400" />
                Current Subscription
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-900/40 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Current Plan</p>
                      <p className="text-lg font-bold text-white">Free Plan</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-900/40 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Next Billing Date</p>
                      <p className="text-lg font-bold text-white">Never</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Subscription
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Info className="w-4 h-4 mr-2" />
                  View Usage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing History */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Receipt className="w-6 h-6 text-blue-400" />
                Billing History
              </CardTitle>
              <CardDescription className="text-gray-400">
                View and download your past invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-gray-900/40 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{invoice.id}</p>
                        <p className="text-sm text-gray-400">{invoice.period} • {invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-white">{invoice.amount}</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {invoice.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {invoices.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No billing history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Method */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-400" />
                Payment Method
              </CardTitle>
              <CardDescription className="text-gray-400">
                Add or update your payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-gray-900/40 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">No payment method</p>
                      <p className="text-sm text-gray-400">Add a payment method to upgrade your plan</p>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0">
                    Add Payment Method
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

