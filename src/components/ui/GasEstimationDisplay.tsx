'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Fuel, TrendingUp, Clock, DollarSign } from 'lucide-react';

interface GasEstimate {
  estimatedGas: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  estimatedCostETH: string;
  estimatedCostUSD?: string;
}

interface GasEstimationDisplayProps {
  estimate: GasEstimate | null;
  isLoading: boolean;
  error?: string | null;
  onRefresh?: () => void;
  showDetails?: boolean;
  speed?: 'slow' | 'standard' | 'fast';
  onSpeedChange?: (speed: 'slow' | 'standard' | 'fast') => void;
}

export function GasEstimationDisplay({
  estimate,
  isLoading,
  error,
  onRefresh,
  showDetails = false,
  speed = 'standard',
  onSpeedChange
}: GasEstimationDisplayProps) {
  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Fuel className="h-4 w-4 animate-spin" />
            <span className="text-sm">Estimating gas costs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="text-red-700 text-sm">{error}</div>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="text-red-700 hover:text-red-800"
              >
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!estimate) {
    return null;
  }

  const formatGasPrice = (gasPrice: bigint) => {
    return (Number(gasPrice) / 1e9).toFixed(2);
  };

  const getSpeedColor = (currentSpeed: string) => {
    const colors = {
      slow: 'bg-green-100 text-green-800 border-green-200',
      standard: 'bg-blue-100 text-blue-800 border-blue-200',
      fast: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[currentSpeed as keyof typeof colors] || colors.standard;
  };

  const getSpeedIcon = () => {
    switch (speed) {
      case 'slow': return <Clock className="h-3 w-3" />;
      case 'fast': return <TrendingUp className="h-3 w-3" />;
      default: return <Fuel className="h-3 w-3" />;
    }
  };

  return (
    <Card className="border-gray-200">
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-sm">Gas Estimate</span>
            </div>
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                Refresh
              </Button>
            )}
          </div>

          {/* Speed Selection */}
          {onSpeedChange && (
            <div className="flex gap-2">
              {(['slow', 'standard', 'fast'] as const).map((speedOption) => (
                <button
                  key={speedOption}
                  onClick={() => onSpeedChange(speedOption)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    speed === speedOption
                      ? getSpeedColor(speedOption)
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {speedOption === 'slow' && <Clock className="h-3 w-3" />}
                  {speedOption === 'standard' && <Fuel className="h-3 w-3" />}
                  {speedOption === 'fast' && <TrendingUp className="h-3 w-3" />}
                  {speedOption.charAt(0).toUpperCase() + speedOption.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Cost Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Fuel className="h-3 w-3" />
                Estimated Cost
              </div>
              <div className="font-medium">{estimate.estimatedCostETH} ETH</div>
              {estimate.estimatedCostUSD && (
                <div className="text-xs text-gray-500">≈ ${estimate.estimatedCostUSD} USD</div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Badge variant="outline" className="w-fit">
                  {getSpeedIcon()}
                  <span className="ml-1">{speed}</span>
                </Badge>
              </div>
              <div className="font-medium">
                {formatGasPrice(estimate.gasPrice)} Gwei
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          {showDetails && (
            <div className="border-t pt-3 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Gas Limit:</span>
                  <div className="font-mono">{estimate.estimatedGas.toString()}</div>
                </div>
                <div>
                  <span className="text-gray-500">Gas Price:</span>
                  <div className="font-mono">{formatGasPrice(estimate.gasPrice)} Gwei</div>
                </div>
              </div>

              {estimate.maxFeePerGas && estimate.maxPriorityFeePerGas && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Max Fee:</span>
                    <div className="font-mono">{formatGasPrice(estimate.maxFeePerGas)} Gwei</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Priority Fee:</span>
                    <div className="font-mono">{formatGasPrice(estimate.maxPriorityFeePerGas)} Gwei</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning for high costs */}
          {estimate.estimatedCostUSD && parseFloat(estimate.estimatedCostUSD) > 20 && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <DollarSign className="h-3 w-3" />
              High gas cost detected. Consider waiting for lower network congestion.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}