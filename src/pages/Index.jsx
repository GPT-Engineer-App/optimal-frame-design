import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Index = () => {
  const [variables, setVariables] = useState(Array(8).fill(0));
  const [result, setResult] = useState(null);

  const handleChange = (index, value) => {
    const newVariables = [...variables];
    newVariables[index] = parseFloat(value);
    setVariables(newVariables);
  };

  const handleOptimize = async () => {
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variables }),
      });

      if (!response.ok) {
        throw new Error('Optimization failed');
      }

      const data = await response.json();
      setResult(data);
      toast("Optimization successful!");
    } catch (error) {
      toast.error("Optimization failed: " + error.message);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl text-center">Frame Weight Optimization</h1>
      <div className="space-y-2">
        {variables.map((variable, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Label htmlFor={`variable-${index}`}>Variable {index + 1}</Label>
            <Input
              id={`variable-${index}`}
              type="number"
              value={variable}
              onChange={(e) => handleChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>
      <Button onClick={handleOptimize}>Optimize</Button>
      {result && (
        <div className="mt-4">
          <h2 className="text-2xl">Optimization Result</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Index;