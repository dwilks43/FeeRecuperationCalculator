import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerInfo } from "@/types/calculator";

const customerInfoSchema = z.object({
  businessName: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  contactName: z.string().optional(),
  contactTitle: z.string().optional(),
  contactEmail: z.string().optional(),
  salesRepName: z.string().optional(),
  salesRepEmail: z.string().optional(),
  salesRepPhone: z.string().optional()
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
      streetAddress: initialData?.streetAddress || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      zipCode: initialData?.zipCode || "",
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
        <div className="space-y-6">
          {/* Business Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  data-testid="input-business-name"
                  {...register("businessName")}
                  placeholder="Enter business name"
                />
              </div>

              <div>
                <Label htmlFor="streetAddress" className="text-sm font-medium text-gray-700">
                  Street Address
                </Label>
                <Input
                  id="streetAddress"
                  data-testid="input-street-address"
                  {...register("streetAddress")}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    City
                  </Label>
                  <Input
                    id="city"
                    data-testid="input-city"
                    {...register("city")}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                    ZIP Code
                  </Label>
                  <Input
                    id="zipCode"
                    data-testid="input-zip-code"
                    {...register("zipCode")}
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                  State
                </Label>
                <Select onValueChange={(value) => setValue("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AL">Alabama</SelectItem>
                    <SelectItem value="AK">Alaska</SelectItem>
                    <SelectItem value="AZ">Arizona</SelectItem>
                    <SelectItem value="AR">Arkansas</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="CO">Colorado</SelectItem>
                    <SelectItem value="CT">Connecticut</SelectItem>
                    <SelectItem value="DE">Delaware</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="GA">Georgia</SelectItem>
                    <SelectItem value="HI">Hawaii</SelectItem>
                    <SelectItem value="ID">Idaho</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="IN">Indiana</SelectItem>
                    <SelectItem value="IA">Iowa</SelectItem>
                    <SelectItem value="KS">Kansas</SelectItem>
                    <SelectItem value="KY">Kentucky</SelectItem>
                    <SelectItem value="LA">Louisiana</SelectItem>
                    <SelectItem value="ME">Maine</SelectItem>
                    <SelectItem value="MD">Maryland</SelectItem>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                    <SelectItem value="MI">Michigan</SelectItem>
                    <SelectItem value="MN">Minnesota</SelectItem>
                    <SelectItem value="MS">Mississippi</SelectItem>
                    <SelectItem value="MO">Missouri</SelectItem>
                    <SelectItem value="MT">Montana</SelectItem>
                    <SelectItem value="NE">Nebraska</SelectItem>
                    <SelectItem value="NV">Nevada</SelectItem>
                    <SelectItem value="NH">New Hampshire</SelectItem>
                    <SelectItem value="NJ">New Jersey</SelectItem>
                    <SelectItem value="NM">New Mexico</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="NC">North Carolina</SelectItem>
                    <SelectItem value="ND">North Dakota</SelectItem>
                    <SelectItem value="OH">Ohio</SelectItem>
                    <SelectItem value="OK">Oklahoma</SelectItem>
                    <SelectItem value="OR">Oregon</SelectItem>
                    <SelectItem value="PA">Pennsylvania</SelectItem>
                    <SelectItem value="RI">Rhode Island</SelectItem>
                    <SelectItem value="SC">South Carolina</SelectItem>
                    <SelectItem value="SD">South Dakota</SelectItem>
                    <SelectItem value="TN">Tennessee</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="UT">Utah</SelectItem>
                    <SelectItem value="VT">Vermont</SelectItem>
                    <SelectItem value="VA">Virginia</SelectItem>
                    <SelectItem value="WA">Washington</SelectItem>
                    <SelectItem value="WV">West Virginia</SelectItem>
                    <SelectItem value="WI">Wisconsin</SelectItem>
                    <SelectItem value="WY">Wyoming</SelectItem>
                    <SelectItem value="DC">District of Columbia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
                  Contact Name
                </Label>
                <Input
                  id="contactName"
                  data-testid="input-contact-name"
                  {...register("contactName")}
                  placeholder="Enter contact name"
                />
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
                />
              </div>

              <div>
                <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700">
                  Contact Email
                </Label>
                <Input
                  id="contactEmail"
                  data-testid="input-contact-email"
                  type="email"
                  {...register("contactEmail")}
                  placeholder="contact@business.com"
                />
              </div>
            </div>
          </div>

          {/* Sales Rep Information Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Representative Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="salesRepName" className="text-sm font-medium text-gray-700">
                  Sales Rep Name
                </Label>
                <Input
                  id="salesRepName"
                  data-testid="input-sales-rep-name"
                  {...register("salesRepName")}
                  placeholder="Enter sales rep name"
                />
              </div>

              <div>
                <Label htmlFor="salesRepEmail" className="text-sm font-medium text-gray-700">
                  Sales Rep Email
                </Label>
                <Input
                  id="salesRepEmail"
                  data-testid="input-sales-rep-email"
                  type="email"
                  {...register("salesRepEmail")}
                  placeholder="salesrep@dmprocessing.com"
                />
              </div>

              <div>
                <Label htmlFor="salesRepPhone" className="text-sm font-medium text-gray-700">
                  Sales Rep Phone
                </Label>
                <Input
                  id="salesRepPhone"
                  data-testid="input-sales-rep-phone"
                  {...register("salesRepPhone")}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}