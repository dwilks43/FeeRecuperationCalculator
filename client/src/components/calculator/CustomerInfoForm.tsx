import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerInfo } from "@/types/calculator";

const customerInfoSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactTitle: z.string().optional(),
  contactEmail: z.string().email("Please enter a valid email address"),
  salesRepName: z.string().min(1, "Sales rep name is required"),
  salesRepEmail: z.string().email("Please enter a valid sales rep email"),
  salesRepPhone: z.string().min(10, "Please enter a valid phone number")
});

interface CustomerInfoFormProps {
  onDataChange: (data: Partial<CustomerInfo>) => void;
  initialData?: Partial<CustomerInfo>;
}

export function CustomerInfoForm({ onDataChange, initialData }: CustomerInfoFormProps) {
  const {
    register,
    formState: { errors },
    watch,
    setValue
  } = useForm<CustomerInfo>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      businessName: initialData?.businessName || "",
      businessAddress: initialData?.businessAddress || "",
      contactName: initialData?.contactName || "",
      contactTitle: initialData?.contactTitle || "",
      contactEmail: initialData?.contactEmail || "",
      salesRepName: initialData?.salesRepName || "",
      salesRepEmail: initialData?.salesRepEmail || "",
      salesRepPhone: initialData?.salesRepPhone || ""
    },
    mode: "onChange"
  });

  // Watch all form values and emit changes
  const watchedValues = watch();
  
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      onDataChange(watchedValues);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [JSON.stringify(watchedValues)]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue("salesRepPhone", formatted);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Customer Information
        </CardTitle>
        <CardDescription>
          Enter business and contact details for the savings report
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
                Business Name *
              </Label>
              <Input
                id="businessName"
                data-testid="input-business-name"
                {...register("businessName")}
                placeholder="Enter business name"
                className={errors.businessName ? "border-red-500" : ""}
              />
              {errors.businessName && (
                <p className="text-sm text-red-500 mt-1">{errors.businessName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="businessAddress" className="text-sm font-medium text-gray-700">
                Business Address *
              </Label>
              <Input
                id="businessAddress"
                data-testid="input-business-address"
                {...register("businessAddress")}
                placeholder="123 Main St, City, State 12345"
                className={errors.businessAddress ? "border-red-500" : ""}
              />
              {errors.businessAddress && (
                <p className="text-sm text-red-500 mt-1">{errors.businessAddress.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
                Contact Name *
              </Label>
              <Input
                id="contactName"
                data-testid="input-contact-name"
                {...register("contactName")}
                placeholder="Enter contact name"
                className={errors.contactName ? "border-red-500" : ""}
              />
              {errors.contactName && (
                <p className="text-sm text-red-500 mt-1">{errors.contactName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contactTitle" className="text-sm font-medium text-gray-700">
                Contact Title
              </Label>
              <Input
                id="contactTitle"
                data-testid="input-contact-title"
                {...register("contactTitle")}
                placeholder="Owner, Manager, etc."
                className={errors.contactTitle ? "border-red-500" : ""}
              />
            </div>

            <div>
              <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700">
                Contact Email *
              </Label>
              <Input
                id="contactEmail"
                data-testid="input-contact-email"
                type="email"
                {...register("contactEmail")}
                placeholder="contact@business.com"
                className={errors.contactEmail ? "border-red-500" : ""}
              />
              {errors.contactEmail && (
                <p className="text-sm text-red-500 mt-1">{errors.contactEmail.message}</p>
              )}
            </div>
          </div>

          {/* Sales Rep Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="salesRepName" className="text-sm font-medium text-gray-700">
                Sales Rep Name *
              </Label>
              <Input
                id="salesRepName"
                data-testid="input-sales-rep-name"
                {...register("salesRepName")}
                placeholder="Enter sales rep name"
                className={errors.salesRepName ? "border-red-500" : ""}
              />
              {errors.salesRepName && (
                <p className="text-sm text-red-500 mt-1">{errors.salesRepName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="salesRepEmail" className="text-sm font-medium text-gray-700">
                Sales Rep Email *
              </Label>
              <Input
                id="salesRepEmail"
                data-testid="input-sales-rep-email"
                type="email"
                {...register("salesRepEmail")}
                placeholder="salesrep@dmprocessing.com"
                className={errors.salesRepEmail ? "border-red-500" : ""}
              />
              {errors.salesRepEmail && (
                <p className="text-sm text-red-500 mt-1">{errors.salesRepEmail.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="salesRepPhone" className="text-sm font-medium text-gray-700">
                Sales Rep Phone *
              </Label>
              <Input
                id="salesRepPhone"
                data-testid="input-sales-rep-phone"
                {...register("salesRepPhone")}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                maxLength={14}
                className={errors.salesRepPhone ? "border-red-500" : ""}
              />
              {errors.salesRepPhone && (
                <p className="text-sm text-red-500 mt-1">{errors.salesRepPhone.message}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}