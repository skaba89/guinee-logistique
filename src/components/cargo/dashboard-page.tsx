'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Plus,
  UserPlus,
  FileText,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { shipments, dashboardStats, statusLabels, typeLabels, formatDZD, formatDate } from '@/lib/test-data';
import { useCargoStore } from '@/lib/cargo-store';

const statusColors: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmee: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  en_transit: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  livree: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  retardee: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  annulee: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const typeColors: Record<string, string> = {
  aerien: '#3b7cff',
  maritime: '#00c9a7',
  terrestre: '#f59e0b',
};

const kpiCards = [
  {
    title: 'Total Expéditions',
    value: dashboardStats.totalShipments,
    icon: Package,
    trend: '+12%',
    trendUp: true,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'En Transit',
    value: dashboardStats.shipmentsByStatus.find(s => s.status === 'en_transit')?.count || 0,
    icon: Truck,
    trend: '',
    trendUp: true,
    color: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Livrées ce mois',
    value: dashboardStats.shipmentsByStatus.find(s => s.status === 'livree')?.count || 0,
    icon: CheckCircle2,
    trend: '+8%',
    trendUp: true,
    color: 'from-green-500 to-green-600',
  },
  {
    title: "Chiffre d'affaires",
    value: formatDZD(dashboardStats.revenue.reduce((a, b) => a + b.amount, 0)),
    icon: DollarSign,
    trend: '+15%',
    trendUp: true,
    color: 'from-emerald-500 to-teal-600',
  },
];

export default function DashboardPage() {
  const setPage = useCargoStore((s) => s.setPage);

  const recentShipments = [...shipments].sort((a, b) =>
    new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
  ).slice(0, 5);

  const pieData = dashboardStats.shipmentsByType.map(item => ({
    name: typeLabels[item.type],
    value: item.count,
    color: typeColors[item.type],
  }));

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Vue d&apos;ensemble de votre activité logistique</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs">
            <TrendingUp className="w-4 h-4 mr-1" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {typeof card.value === 'number' ? card.value.toLocaleString('fr-FR') : card.value}
                    </p>
                    {card.trend && (
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-medium text-green-500">{card.trend}</span>
                        <span className="text-xs text-gray-400">vs mois dernier</span>
                      </div>
                    )}
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                    <card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenus mensuels</CardTitle>
            <CardDescription>Évolution du chiffre d&apos;affaires sur 12 mois</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardStats.revenue} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatDZD(value), 'Revenu']}
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#1a56db" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Shipments by Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Expéditions par type</CardTitle>
            <CardDescription>Répartition des envois</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span style={{ fontSize: '12px', color: 'var(--foreground)' }}>{value}</span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Shipments */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Expéditions récentes</CardTitle>
                <CardDescription>Les 5 dernières expéditions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage('shipments')}>
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">N° Suivi</TableHead>
                    <TableHead className="text-xs">Client</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Trajet</TableHead>
                    <TableHead className="text-xs">Statut</TableHead>
                    <TableHead className="text-xs text-right">Prix</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        {shipment.trackingNumber}
                      </TableCell>
                      <TableCell className="text-xs">{shipment.clientName}</TableCell>
                      <TableCell className="text-xs hidden sm:table-cell">
                        {shipment.origin} → {shipment.destination}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${statusColors[shipment.status]}`}>
                          {statusLabels[shipment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium">
                        {formatDZD(shipment.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Actions rapides</CardTitle>
            <CardDescription>Raccourcis fréquents</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            <Button
              className="w-full justify-start gap-3 h-11"
              style={{ background: 'linear-gradient(135deg, #1a56db, #3b7cff)' }}
              onClick={() => setPage('shipments')}
            >
              <Plus className="w-4 h-4" />
              Nouvelle expédition
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-11"
              onClick={() => setPage('clients')}
            >
              <UserPlus className="w-4 h-4" />
              Nouveau client
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-11"
              onClick={() => setPage('billing')}
            >
              <FileText className="w-4 h-4" />
              Nouvelle facture
            </Button>

            {/* Mini Stats */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Véhicules actifs</span>
                <span className="font-semibold text-gray-900 dark:text-white">{dashboardStats.activeVehicles}/{10}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${(dashboardStats.activeVehicles / 10) * 100}%`, background: 'linear-gradient(135deg, #00c9a7, #3b7cff)' }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Clients enregistrés</span>
                <span className="font-semibold text-gray-900 dark:text-white">{dashboardStats.clientsCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
