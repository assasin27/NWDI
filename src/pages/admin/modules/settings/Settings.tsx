import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your admin settings</p>
      </div>
      
      <div className="grid gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Site Settings</h3>
          <div className="space-y-4">
            <div>
              <Label>Site Name</Label>
              <Input type="text" placeholder="FarmFresh" />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input type="email" placeholder="admin@farmfresh.com" />
            </div>
            <div>
              <Label>Support Phone</Label>
              <Input type="tel" placeholder="+91 1234567890" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Email Settings</h3>
          <div className="space-y-4">
            <div>
              <Label>SMTP Host</Label>
              <Input type="text" placeholder="smtp.example.com" />
            </div>
            <div>
              <Label>SMTP Port</Label>
              <Input type="number" placeholder="587" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">System Settings</h3>
          <div className="space-y-4">
            <div>
              <Label>Debug Mode</Label>
              <Input type="checkbox" />
            </div>
            <div>
              <Label>Maintenance Mode</Label>
              <Input type="checkbox" />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full sm:w-auto">
          Save Changes
        </Button>
      </div>
    </div>
  );
}