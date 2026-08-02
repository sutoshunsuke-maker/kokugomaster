import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useListUnits, useDeleteUnit, getListUnitsQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import { UnitFormDialog } from '@/components/unit-form-dialog';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function Units() {
  const { data: units, isLoading } = useListUnits();
  const deleteUnit = useDeleteUnit();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteUnit.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListUnitsQueryKey() });
          toast({ title: '単元を削除しました' });
        },
        onError: () => {
          toast({ title: '削除に失敗しました', variant: 'destructive' });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif mb-2">
            単元一覧
          </h1>
          <p className="text-muted-foreground text-sm">
            すべての単元と進捗状況
          </p>
        </div>
        <UnitFormDialog />
      </motion.div>

      {!units || units.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                まだ単元が登録されていません
              </p>
              <UnitFormDialog />
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {units.map((unit, index) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              data-testid={`card-unit-${unit.id}`}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/units/${unit.id}`}
                        className="hover:text-primary transition-colors"
                        data-testid={`link-unit-${unit.id}`}
                      >
                        <CardTitle className="font-serif">
                          {unit.title}
                        </CardTitle>
                      </Link>
                      {unit.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {unit.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <UnitFormDialog unit={unit} variant="edit" />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-delete-unit-${unit.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              単元を削除しますか？
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              この操作は取り消せません。単元に紐づく授業も削除されます。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-testid="button-cancel-delete">
                              キャンセル
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(unit.id)}
                              data-testid="button-confirm-delete"
                            >
                              削除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">進捗</span>
                      <span className="font-medium">
                        {unit.completedCount} / {unit.totalCount} 授業
                      </span>
                    </div>
                    <Progress
                      value={
                        unit.totalCount > 0
                          ? (unit.completedCount / unit.totalCount) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
