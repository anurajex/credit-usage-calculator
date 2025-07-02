
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Save, Settings as SettingsIcon } from "lucide-react";

interface Setting {
  id: string;
  category: string;
  key: string;
  value: string | null;
}

export const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [systemSettings, setSystemSettings] = useState({
    timezone: 'UTC',
    language: 'en',
    date_format: 'YYYY-MM-DD'
  });

  const [generalSettings, setGeneralSettings] = useState({
    default_currency: 'USD',
    items_per_page: '10',
    auto_refresh: 'true'
  });

  const [brandingSettings, setBrandingSettings] = useState({
    company_name: 'My Company',
    company_logo_url: '',
    primary_color: '#10b981',
    secondary_color: '#374151'
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      setSettings(data || []);
      
      // Populate form states with loaded settings
      const systemData: any = {};
      const generalData: any = {};
      const brandingData: any = {};

      data?.forEach((setting) => {
        if (setting.category === 'system') {
          systemData[setting.key] = setting.value;
        } else if (setting.category === 'general') {
          generalData[setting.key] = setting.value;
        } else if (setting.category === 'branding') {
          brandingData[setting.key] = setting.value;
        }
      });

      setSystemSettings(prev => ({ ...prev, ...systemData }));
      setGeneralSettings(prev => ({ ...prev, ...generalData }));
      setBrandingSettings(prev => ({ ...prev, ...brandingData }));

    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (category: string, settingsData: any) => {
    setSaving(true);
    try {
      const settingsToUpdate = Object.entries(settingsData).map(([key, value]) => ({
        user_id: user?.id,
        category,
        key,
        value: String(value),
      }));

      for (const setting of settingsToUpdate) {
        const { error } = await supabase
          .from('settings')
          .upsert(setting, {
            onConflict: 'user_id,category,key'
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully.`,
      });

      await loadSettings(); // Reload to get updated data
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-green-600" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="system" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
            </TabsList>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select 
                        value={systemSettings.timezone} 
                        onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Europe/Paris">Paris</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select 
                        value={systemSettings.language} 
                        onValueChange={(value) => setSystemSettings(prev => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_format">Date Format</Label>
                      <Select 
                        value={systemSettings.date_format} 
                        onValueChange={(value) => setSystemSettings(prev => ({ ...prev, date_format: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={() => saveSettings('system', systemSettings)}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save System Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">General Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="default_currency">Default Currency</Label>
                      <Select 
                        value={generalSettings.default_currency} 
                        onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, default_currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="items_per_page">Items Per Page</Label>
                      <Select 
                        value={generalSettings.items_per_page} 
                        onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, items_per_page: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select items per page" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="auto_refresh">Auto Refresh</Label>
                      <Select 
                        value={generalSettings.auto_refresh} 
                        onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, auto_refresh: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select auto refresh" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Enabled</SelectItem>
                          <SelectItem value="false">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={() => saveSettings('general', generalSettings)}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save General Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branding Settings */}
            <TabsContent value="branding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Branding & Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        value={brandingSettings.company_name}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, company_name: e.target.value }))}
                        placeholder="Enter company name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_logo_url">Company Logo URL</Label>
                      <Input
                        id="company_logo_url"
                        value={brandingSettings.company_logo_url}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, company_logo_url: e.target.value }))}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primary_color">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary_color"
                          type="color"
                          value={brandingSettings.primary_color}
                          onChange={(e) => setBrandingSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={brandingSettings.primary_color}
                          onChange={(e) => setBrandingSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                          placeholder="#10b981"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary_color">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          value={brandingSettings.secondary_color}
                          onChange={(e) => setBrandingSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={brandingSettings.secondary_color}
                          onChange={(e) => setBrandingSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                          placeholder="#374151"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => saveSettings('branding', brandingSettings)}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Branding Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
