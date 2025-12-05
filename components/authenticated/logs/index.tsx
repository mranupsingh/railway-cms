'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, Search } from 'lucide-react';
import { useState } from 'react';

import { getAuditLogs } from '@/app/(authenticated)/logs/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LogsPage() {
    const [page, setPage] = useState(1);
    const [userId, setUserId] = useState('');
    const [action, setAction] = useState<string>('ALL');
    const [entity, setEntity] = useState('');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['audit-logs', page, userId, action, entity],
        queryFn: async () => {
            const response = await getAuditLogs({
                page,
                pageSize: 20,
                userId: userId || undefined,
                action: action === 'ALL' ? undefined : action,
                entity: entity || undefined,
            });
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page on search
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            placeholder="Search by User ID..."
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                        />
                        <Select value={action} onValueChange={setAction}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Actions</SelectItem>
                                <SelectItem value="CREATE">CREATE</SelectItem>
                                <SelectItem value="UPDATE">UPDATE</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Search by Entity..."
                            value={entity}
                            onChange={(e) => setEntity(e.target.value)}
                        />
                        {/* Date filter can be added here */}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Coach No.</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Changes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-destructive">
                                            Failed to load logs.
                                        </TableCell>
                                    </TableRow>
                                ) : data?.items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No logs found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.items.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}
                                            </TableCell>
                                            <TableCell>{log.user_id}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                                                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </TableCell>
                                            <TableCell>{log.entity}</TableCell>
                                            <TableCell className="max-w-[150px] truncate" title={log.entity_id}>
                                                {log.entity_id}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={log.details || ''}>
                                                {log.details}
                                            </TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">View</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl max-h-[80vh]">
                                                        <DialogHeader>
                                                            <DialogTitle>Log Details</DialogTitle>
                                                        </DialogHeader>
                                                        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="mb-2 font-medium text-muted-foreground">Old Data</h4>
                                                                    <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                                                                        {log.old_data ? JSON.stringify(log.old_data, null, 2) : 'N/A'}
                                                                    </pre>
                                                                </div>
                                                                <div>
                                                                    <h4 className="mb-2 font-medium text-muted-foreground">New Data</h4>
                                                                    <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                                                                        {log.new_data ? JSON.stringify(log.new_data, null, 2) : 'N/A'}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        </ScrollArea>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {data?.pagination && (
                        <div className="flex items-center justify-end space-x-2 py-4 px-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                            >
                                Previous
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                Page {page} of {data.pagination.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                                disabled={page === data.pagination.totalPages || isLoading}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
