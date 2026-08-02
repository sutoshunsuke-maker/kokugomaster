import { Link } from 'wouter';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center">
          <h1 className="text-6xl font-bold text-primary font-serif mb-4">404</h1>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            ページが見つかりません
          </h2>
          <p className="text-muted-foreground mb-6">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
          <Link href="/">
            <Button data-testid="button-home">
              <Home className="w-4 h-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
