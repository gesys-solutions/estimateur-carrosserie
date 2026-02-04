/**
 * Devis Item Editor Component
 * Inline editing for devis items
 */

"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/utils";
import { 
  devisItemSchema, 
  DevisItemFormData, 
  DevisItemTypeLabels,
  DevisItemTypeType,
  calculateItemTotal,
} from "@/lib/validations/devis";
import { DevisItem, useAddDevisItem, useUpdateDevisItem, useDeleteDevisItem } from "@/hooks/devis";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

interface DevisItemEditorProps {
  devisId: string;
  items: DevisItem[];
  isEditable: boolean;
  onTotalsChange?: (totals: { subtotal: number; tps: number; tvq: number; total: number }) => void;
}

const ITEM_TYPES: DevisItemTypeType[] = ['MAIN_OEUVRE', 'PIECE', 'PEINTURE', 'AUTRE'];

export function DevisItemEditor({ 
  devisId, 
  items, 
  isEditable,
  onTotalsChange 
}: DevisItemEditorProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [addItemType, setAddItemType] = useState<DevisItemTypeType>('MAIN_OEUVRE');
  
  const { mutate: addItem, isPending: isAdding } = useAddDevisItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateDevisItem();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteDevisItem();

  // Group items by type
  const itemsByType = useMemo(() => {
    const grouped: Record<DevisItemTypeType, DevisItem[]> = {
      MAIN_OEUVRE: [],
      PIECE: [],
      PEINTURE: [],
      AUTRE: [],
    };
    
    items.forEach(item => {
      if (grouped[item.type as DevisItemTypeType]) {
        grouped[item.type as DevisItemTypeType].push(item);
      }
    });
    
    return grouped;
  }, [items]);

  // Calculate subtotals by type
  const subtotalsByType = useMemo(() => {
    const result: Record<DevisItemTypeType, number> = {
      MAIN_OEUVRE: 0,
      PIECE: 0,
      PEINTURE: 0,
      AUTRE: 0,
    };
    
    ITEM_TYPES.forEach(type => {
      result[type] = itemsByType[type].reduce((sum, item) => sum + item.total, 0);
    });
    
    return result;
  }, [itemsByType]);

  const form = useForm<DevisItemFormData>({
    resolver: zodResolver(devisItemSchema),
    defaultValues: {
      description: "",
      type: "MAIN_OEUVRE",
      quantity: 1,
      unitPrice: 0,
    },
  });

  const handleAddItem = (data: DevisItemFormData) => {
    addItem(
      { devisId, data },
      {
        onSuccess: (response) => {
          toast.success("Item ajouté");
          form.reset();
          setIsAddingItem(false);
          onTotalsChange?.(response.totals);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleUpdateItem = (itemId: string, data: Partial<DevisItemFormData>) => {
    updateItem(
      { devisId, itemId, data },
      {
        onSuccess: (response) => {
          toast.success("Item modifié");
          setEditingItemId(null);
          onTotalsChange?.(response.totals);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItem(
      { devisId, itemId },
      {
        onSuccess: () => {
          toast.success("Item supprimé");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const startAddingItem = (type: DevisItemTypeType) => {
    setAddItemType(type);
    form.reset({
      description: "",
      type,
      quantity: 1,
      unitPrice: 0,
    });
    setIsAddingItem(true);
  };

  const renderItemRow = (item: DevisItem) => {
    const isEditing = editingItemId === item.id;

    if (isEditing) {
      return (
        <EditableItemRow
          key={item.id}
          item={item}
          onSave={(data) => handleUpdateItem(item.id, data)}
          onCancel={() => setEditingItemId(null)}
          isPending={isUpdating}
        />
      );
    }

    return (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.description}</TableCell>
        <TableCell className="text-right">{item.quantity}</TableCell>
        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
        <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
        {isEditable && (
          <TableCell className="text-right">
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingItemId(item.id)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer cet item?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={isDeleting}
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  };

  const renderTypeSection = (type: DevisItemTypeType) => {
    const typeItems = itemsByType[type];
    const subtotal = subtotalsByType[type];

    return (
      <div key={type} className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
            {DevisItemTypeLabels[type]}
          </h4>
          {isEditable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startAddingItem(type)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="text-right w-[15%]">Qté</TableHead>
              <TableHead className="text-right w-[20%]">Prix unit.</TableHead>
              <TableHead className="text-right w-[15%]">Total</TableHead>
              {isEditable && <TableHead className="text-right w-[10%]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {typeItems.map(renderItemRow)}
            
            {isAddingItem && addItemType === type && (
              <TableRow>
                <TableCell colSpan={isEditable ? 5 : 4}>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleAddItem)}
                      className="flex items-end gap-2"
                    >
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Description"
                                {...field}
                                autoFocus
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem className="w-20">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Qté"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="unitPrice"
                        render={({ field }) => (
                          <FormItem className="w-28">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Prix"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" size="icon" disabled={isAdding}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsAddingItem(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </form>
                  </Form>
                </TableCell>
              </TableRow>
            )}

            {typeItems.length === 0 && !isAddingItem && (
              <TableRow>
                <TableCell
                  colSpan={isEditable ? 5 : 4}
                  className="text-center text-zinc-500 italic py-4"
                >
                  Aucun item
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {typeItems.length > 0 && (
          <div className="flex justify-end text-sm font-medium">
            <span className="text-zinc-500 mr-2">Sous-total {DevisItemTypeLabels[type]}:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {ITEM_TYPES.map(renderTypeSection)}
    </div>
  );
}

// Editable row sub-component
interface EditableItemRowProps {
  item: DevisItem;
  onSave: (data: Partial<DevisItemFormData>) => void;
  onCancel: () => void;
  isPending: boolean;
}

function EditableItemRow({ item, onSave, onCancel, isPending }: EditableItemRowProps) {
  const form = useForm<DevisItemFormData>({
    resolver: zodResolver(devisItemSchema),
    defaultValues: {
      description: item.description,
      type: item.type,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    },
  });

  // Watch for real-time total calculation
  const quantity = form.watch("quantity");
  const unitPrice = form.watch("unitPrice");
  const liveTotal = useMemo(() => calculateItemTotal(quantity || 0, unitPrice || 0), [quantity, unitPrice]);

  return (
    <TableRow>
      <TableCell>
        <Input
          {...form.register("description")}
          placeholder="Description"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          {...form.register("quantity", { valueAsNumber: true })}
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          min="0"
          {...form.register("unitPrice", { valueAsNumber: true })}
          className="w-28"
        />
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(liveTotal)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={form.handleSubmit(onSave)}
            disabled={isPending}
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
