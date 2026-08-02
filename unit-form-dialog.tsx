import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil } from 'lucide-react';
import {
  useCreateUnit,
  useUpdateUnit,
  getListUnitsQueryKey,
  type Unit,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const unitSchema = z.object({
  title: z.string().min(1, '単元名を入力してください'),
  description: z.string().optional(),
  orderIndex: z.coerce.number().optional(),
});

type UnitFormData = z.infer<typeof unitSchema>;

interface UnitFormDialogProps {
  unit?: Unit;
  variant?: 'create' | 'edit';
}

export function UnitFormDialog({ unit, variant = 'create' }: UnitFormDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      title: unit?.title || '',
      description: unit?.description || '',
      orderIndex: unit?.orderIndex || 0,
    },
  });

  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();

  const onSubmit = (data: UnitFormData) => {
    if (variant === 'edit' && unit) {
      updateUnit.mutate(
        { id: unit.id, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListUnitsQueryKey() });
            toast({ title: '単元を更新しました' });
            setOpen(false);
            form.reset();
          },
          onError: () => {
            toast({ title: '更新に失敗しました', variant: 'destructive' });
          },
        }
      );
    } else {
      createUnit.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListUnitsQueryKey() });
            toast({ title: '単元を作成しました' });
            setOpen(false);
            form.reset();
          },
          onError: () => {
            toast({ title: '作成に失敗しました', variant: 'destructive' });
          },
        }
      );
    }
  };

  const isLoading = createUnit.isPending || updateUnit.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'create' ? (
          <Button data-testid="button-create-unit">
            <Plus className="w-4 h-4 mr-2" />
            単元を追加
          </Button>
        ) : (
          <Button variant="ghost" size="sm" data-testid="button-edit-unit">
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {variant === 'create' ? '単元を追加' : '単元を編集'}
          </DialogTitle>
          <DialogDescription>
            単元の情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>単元名</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="例：物語の読解"
                      data-testid="input-unit-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明（任意）</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="単元の概要や目標を記入"
                      rows={3}
                      data-testid="input-unit-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="orderIndex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>表示順序</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="0"
                      data-testid="input-unit-order"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-submit-unit">
                {isLoading ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
