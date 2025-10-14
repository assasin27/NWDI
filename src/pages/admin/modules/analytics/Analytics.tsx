import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹ 45,231</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">234</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products Sold</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">543</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">123</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Add more analytics components here */}
    </div>
  );
}