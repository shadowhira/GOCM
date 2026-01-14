'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const AdminUsersSkeleton = () => (
  <Card>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="pl-6">&nbsp;</TableHead>
            <TableHead>&nbsp;</TableHead>
            <TableHead>&nbsp;</TableHead>
            <TableHead className="pr-6 text-right">&nbsp;</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, index) => (
            <TableRow key={index} className="animate-pulse">
              <TableCell className="pl-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-3 w-32 rounded-md bg-muted" />
                    <div className="h-2 w-20 rounded-md bg-muted" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="h-3 w-40 rounded-md bg-muted" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-20 rounded-md bg-muted" />
              </TableCell>
              <TableCell className="pr-6 text-right">
                <div className="ml-auto flex w-20 justify-end gap-2">
                  <div className="h-8 w-8 rounded-md bg-muted" />
                  <div className="h-8 w-8 rounded-md bg-muted" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
)
