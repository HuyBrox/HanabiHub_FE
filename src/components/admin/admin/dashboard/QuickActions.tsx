"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, FileText, Download, Plus } from "lucide-react";
import { useState } from "react";
import { createAdmin } from "@/store/services/dashboardApi";

interface QuickActionsProps {
  onCreateUser?: (userData: any) => void;
  onGenerateReport?: (type: string, format: string) => void;
  className?: string;
}

export const QuickActions = ({ 
  onCreateUser, 
  onGenerateReport, 
  className = "" 
}: QuickActionsProps) => {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    level: 'N5'
  });

  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.username || !userForm.password) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    try {
      const adminData = {
        fullname: userForm.name,
        email: userForm.email,
        username: userForm.username,
        password: userForm.password,
      };
      
      const result = await createAdmin(adminData);
      console.log('Admin created successfully:', result);
      
      // Call parent callback if provided
      onCreateUser?.(userForm);
      
      // Reset form and close dialog
      setUserForm({ name: '', email: '', username: '', password: '', level: 'N5' });
      setIsCreateUserOpen(false);
      
      alert('Tạo admin thành công!');
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Có lỗi xảy ra khi tạo admin. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = (type: string, format: string) => {
    onGenerateReport?.(type, format);
    setIsReportOpen(false);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Thao tác nhanh</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {/* Create User */}
          <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="h-4 w-4 mr-2" />
                Tạo admin mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo admin mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên admin</Label>
                  <Input
                    id="name"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="Nhập tên admin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email admin</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="Nhập email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="Nhập username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Nhập mật khẩu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Cấp độ</Label>
                  <Select value={userForm.level} onValueChange={(value) => setUserForm({ ...userForm, level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N5">N5 (Sơ cấp)</SelectItem>
                      <SelectItem value="N4">N4 (Sơ cấp)</SelectItem>
                      <SelectItem value="N3">N3 (Trung cấp)</SelectItem>
                      <SelectItem value="N2">N2 (Trung cấp)</SelectItem>
                      <SelectItem value="N1">N1 (Cao cấp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleCreateUser} 
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang tạo...' : 'Tạo người dùng'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateUserOpen(false)}
                    disabled={isLoading}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Generate Reports */}
          <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Tạo báo cáo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo báo cáo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateReport('users', 'pdf')}
                    className="flex flex-col items-center space-y-2 h-20"
                  >
                    <FileText className="h-6 w-6" />
                    <span>Báo cáo người dùng</span>
                    <span className="text-xs text-gray-500">PDF</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateReport('courses', 'excel')}
                    className="flex flex-col items-center space-y-2 h-20"
                  >
                    <FileText className="h-6 w-6" />
                    <span>Báo cáo khóa học</span>
                    <span className="text-xs text-gray-500">Excel</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateReport('activity', 'pdf')}
                    className="flex flex-col items-center space-y-2 h-20"
                  >
                    <FileText className="h-6 w-6" />
                    <span>Báo cáo hoạt động</span>
                    <span className="text-xs text-gray-500">PDF</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateReport('users', 'excel')}
                    className="flex flex-col items-center space-y-2 h-20"
                  >
                    <Download className="h-6 w-6" />
                    <span>Xuất dữ liệu</span>
                    <span className="text-xs text-gray-500">Excel</span>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
