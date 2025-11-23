/**
 * Loans List Page
 * Displays loans with filters, pagination, and CRUD operations
 */

import {
  BankOutlined,
  CarOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HomeOutlined,
  PlusOutlined,
  ReadOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Empty, Progress, Row, Space, Statistic, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { LoanStatusLabels, LoanTypeLabels } from '@/constants/enum-labels';
import { LoanStatus, LoanType } from '@/constants/enums';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { loanActions, selectIsLoanLoading, selectLoanError } from '@/redux/modules/loans';
import { formatCurrency } from '@/utils/formatters';

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledPageWrapper = styled.div`
  padding: 24px;

  .page-header {
    margin-bottom: 24px;

    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }
  }

  .summary-cards {
    margin-bottom: 24px;
  }

  .loan-card {
    height: 100%;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #e5e7eb;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .loan-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .loan-title {
        display: flex;
        align-items: center;
        gap: 8px;

        .loan-icon {
          font-size: 24px;
          color: #3b82f6;
        }

        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
      }
    }

    .loan-body {
      margin-bottom: 16px;

      .loan-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 16px;
      }

      .progress-section {
        margin-top: 12px;

        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
          color: #6b7280;
        }
      }
    }

    .loan-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }
  }
`;

const LoanStatusTag = styled(Tag)<{ $status: LoanStatus }>`
  background-color: ${(props) => {
    switch (props.$status) {
      case LoanStatus.ACTIVE:
        return '#d1fae5';
      case LoanStatus.PAID_OFF:
        return '#dbeafe';
      case LoanStatus.DEFAULTED:
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case LoanStatus.ACTIVE:
        return '#065f46';
      case LoanStatus.PAID_OFF:
        return '#1e40af';
      case LoanStatus.DEFAULTED:
        return '#7f1d1d';
      default:
        return '#374151';
    }
  }};
  border: none;
  font-weight: 500;
`;

// ============================================
// COMPONENT
// ============================================

const LoansListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const loans = useAppSelector((state) => state.loans.loans);
  const isLoading = useAppSelector(selectIsLoanLoading);
  const error = useAppSelector(selectLoanError);

  // Load loans on mount
  useEffect(() => {
    dispatch(loanActions.listLoansRequest({ page: 1, limit: 20 }));
  }, [dispatch]);

  // Calculate summary statistics
  const summary = React.useMemo(() => {
    const activeLoans = loans.filter((l) => l.status === LoanStatus.ACTIVE);
    const totalPrincipal = activeLoans.reduce((sum, l) => sum + l.principal, 0);
    const totalRemaining = activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
    const totalInterest = activeLoans.reduce((sum, l) => sum + l.totalInterest, 0);
    const monthlyPayment = activeLoans.reduce((sum, l) => sum + l.monthlyPayment, 0);

    return {
      activeLoans: activeLoans.length,
      totalPrincipal,
      totalRemaining,
      totalInterest,
      monthlyPayment,
    };
  }, [loans]);

  // Get icon for loan type
  const getLoanIcon = (type: LoanType) => {
    switch (type) {
      case LoanType.MORTGAGE:
        return <HomeOutlined />;
      case LoanType.AUTO:
        return <CarOutlined />;
      case LoanType.STUDENT:
        return <ReadOutlined />;
      case LoanType.BUSINESS:
        return <ShopOutlined />;
      case LoanType.PERSONAL:
      default:
        return <BankOutlined />;
    }
  };

  // Handle view loan detail
  const handleViewLoan = (loanId: string) => {
    navigate(`/loans/${loanId}`);
  };

  // Handle create loan
  const handleCreateLoan = () => {
    navigate('/loans/create');
  };

  // Handle delete loan
  const handleDeleteLoan = (loanId: string) => {
    dispatch(loanActions.deleteLoanRequest({ id: loanId }));
  };

  return (
    <StyledPageWrapper>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Quản lý khoản vay</h1>
            <p>Theo dõi các khoản vay và lịch trả nợ</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleCreateLoan}>
            Thêm khoản vay
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="summary-cards">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Khoản vay đang hoạt động"
              value={summary.activeLoans}
              suffix="khoản"
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số dư còn lại"
              value={summary.totalRemaining}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Trả hàng tháng"
              value={summary.monthlyPayment}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng tiền lãi"
              value={summary.totalInterest}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#6b7280' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Error Message */}
      {error && (
        <Card style={{ marginBottom: 24, borderColor: '#fca5a5', backgroundColor: '#fee2e2' }}>
          <span style={{ color: '#dc2626' }}>❌ {error}</span>
        </Card>
      )}

      {/* Loans Grid */}
      {isLoading && !loans.length ? (
        <Card style={{ padding: '50px 20px', textAlign: 'center' }}>
          <p>Đang tải dữ liệu...</p>
        </Card>
      ) : loans.length === 0 ? (
        <Empty
          description={
            <div>
              <p>Chưa có khoản vay nào</p>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                Nhấn nút "Thêm khoản vay" để tạo khoản vay đầu tiên
              </p>
            </div>
          }
          style={{ padding: '50px 20px' }}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateLoan}>
            Thêm khoản vay
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {loans.map((loan) => {
            const paidPercentage =
              ((loan.principal - loan.remainingBalance) / loan.principal) * 100;

            return (
              <Col xs={24} sm={12} lg={8} key={loan.id}>
                <Card className="loan-card" onClick={() => handleViewLoan(loan.id)}>
                  {/* Header */}
                  <div className="loan-header">
                    <div className="loan-title">
                      <span className="loan-icon">{getLoanIcon(loan.type)}</span>
                      <div>
                        <h3>{loan.name}</h3>
                        <Tag color="blue">{LoanTypeLabels[loan.type]}</Tag>
                      </div>
                    </div>
                    <LoanStatusTag $status={loan.status}>
                      {LoanStatusLabels[loan.status]}
                    </LoanStatusTag>
                  </div>

                  {/* Body */}
                  <div className="loan-body">
                    <div className="loan-stats">
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Số dư còn lại</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#ef4444' }}>
                          {formatCurrency(loan.remainingBalance)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Trả hàng tháng</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#f59e0b' }}>
                          {formatCurrency(loan.monthlyPayment)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Lãi suất</div>
                        <div style={{ fontSize: '16px', fontWeight: 600 }}>
                          {loan.interestRate}% / năm
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Kỳ hạn</div>
                        <div style={{ fontSize: '16px', fontWeight: 600 }}>
                          {loan.termMonths} tháng
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="progress-section">
                      <div className="progress-label">
                        <span>Đã trả</span>
                        <span>{paidPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress
                        percent={paidPercentage}
                        showInfo={false}
                        strokeColor={paidPercentage === 100 ? '#10b981' : '#3b82f6'}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="loan-footer">
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Bắt đầu: {dayjs(loan.startDate).format('DD/MM/YYYY')}
                    </div>
                    <Space size="small">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewLoan(loan.id);
                        }}
                        title="Xem chi tiết"
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/loans/${loan.id}/edit`);
                        }}
                        title="Chỉnh sửa"
                      />
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLoan(loan.id);
                        }}
                        title="Xóa"
                      />
                    </Space>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </StyledPageWrapper>
  );
};

export default LoansListPage;
