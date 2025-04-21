"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs"
import { CreditCard, Settings, TruckIcon } from "lucide-react"
import GeneralSettings from "@/app/components/store-settings/generals-settings"
import CurrencySettings from "@/app/components/store-settings/currency-settings"
import DeliverySettings from "@/app/components/store-settings/delivery-settings"


export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-700 dark:text-neutral-200 mb-6">Store Settings</h1>

      <Tabs defaultValue="general" >
        <TabsList>
          <TabsTrigger value="general">
            <div className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              General
            </div>
          </TabsTrigger>
          <TabsTrigger value="currency">
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              Currency
            </div>
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <div className="flex items-center gap-1">
              <TruckIcon className="h-4 w-4" />
              Delivery
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="currency">
          <CurrencySettings />
        </TabsContent>

        <TabsContent value="delivery">
          <DeliverySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
