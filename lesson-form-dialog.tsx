import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil } from 'lucide-react';
import {
  useCreateLesson,
  useUpdateLesson,
  getListLessonsQueryKey,
  getGetUnitQueryKey,
  type Lesson,
  LessonStatus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const lessonSchema = z.object({
  title: z.string().min(1, '授業名を入力してください'),
  memo: z.string().optional(),
  status: z.enum(['upcoming', 'in_progress', 'completed']).optional(),
  lessonDate: z.string().optional(),
  orderIndex: z.coerce.number().optional(),
  unitId: z.coerce.number(),
});

type LessonFormData = z.infer<typeof lessonSchema>;

interface LessonFormDialogProps {
  unitId: number;
  lesson?: Lesson;
  variant?: 'create' | 'edit';
}

export function LessonFormDialog({
  unitId,
  lesson,
  variant = 'create',
}: LessonFormDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title || '',
      memo: lesson?.memo || '',
      status: lesson?.status || 'upcoming',
      lessonDate: lesson?.lessonDate || '',
      orderIndex: lesson?.orderIndex || 0,
      unitId: lesson?.unitId || unitId,
    },
  });

  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();

  const onSubmit = (data: LessonFormData) => {
    if (variant === 'edit' && lesson) {
      updateLesson.mutate(
        { id: lesson.id, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListLessonsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetUnitQueryKey(unitId) });
            toast({ title: '授業を更新しました' });
            setOpen(false);
            form.reset();
          },
          onError: () => {
            toast({ title: '更新に失敗しました', variant: 'destructive' });
          },
        }
      );
    } else {
      createLesson.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListLessonsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetUnitQueryKey(unitId) });
            toast({ title: '授業を作成しました' });
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

  const isLoading = createLesson.isPending || updateLesson.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'create' ? (
          <Button size="sm" data-testid="button-create-lesson">
            <Plus className="w-4 h-4 mr-2" />
            授業を追加
          </Button>
        ) : (
          <Button variant="ghost" size="sm" data-testid="button-edit-lesson">
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {variant === 'create' ? '授業を追加' : '授業を編集'}
          </DialogTitle>
          <DialogDescription>
            授業の情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>授業名</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="例：第1回 登場人物の心情"
                      data-testid="input-lesson-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ステータス</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-lesson-status">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="upcoming">未実施</SelectItem>
                      <SelectItem value="in_progress">授業中</SelectItem>
                      <SelectItem value="completed">完了</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lessonDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>実施日（任意）</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      data-testid="input-lesson-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メモ（任意）</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="授業の内容や気づきを記入"
                      rows={3}
                      data-testid="input-lesson-memo"
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
                      data-testid="input-lesson-order"
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
              <Button type="submit" disabled={isLoading} data-testid="button-submit-lesson">
                {isLoading ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
