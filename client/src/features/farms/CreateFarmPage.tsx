import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api-client.js";
import { FarmForm, FarmFormData } from "./FarmForm.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.js";
import { toast } from "sonner";
import { Trees } from "lucide-react";

export function CreateFarmPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: FarmFormData) => {
    setLoading(true);
    try {
      await api.post("/farms", data);
      toast.success("Farm registered successfully!");
      navigate("/app/farms");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register farm";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Trees className="w-6 h-6 text-emerald-600" /> Register New Farm
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Record soil parameters, location, and irrigation availability to enable AI-powered crop advisory.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Farm Information Form</CardTitle>
          <CardDescription>All fields marked with an asterisk (*) are required</CardDescription>
        </CardHeader>
        <CardContent>
          <FarmForm onSubmit={handleSubmit} isLoading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
