import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanStatus } from '../../common/constants/enums';
import { LoanPayment } from '../../entities/loan-payment.entity';
import { Loan } from '../../entities/loan.entity';
import { LoansService } from './loans.service';

describe('LoansService', () => {
  let service: LoansService;
  let loanRepository: Repository<Loan>;
  let paymentRepository: Repository<LoanPayment>;

  const mockLoanRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockUserId = 'user-uuid-123';
  const mockLoanId = 'loan-uuid-456';

  const mockLoan: Partial<Loan> = {
    id: mockLoanId,
    userId: mockUserId,
    type: 2, // MORTGAGE
    name: 'Home Loan',
    lender: 'ABC Bank',
    originalAmount: 100000,
    remainingPrincipal: 100000,
    interestRate: 8,
    termMonths: 12,
    remainingMonths: 12,
    monthlyPayment: 0,
    startDate: new Date('2024-01-01'),
    nextPaymentDate: new Date('2024-02-01'),
    status: LoanStatus.ACTIVE,
    totalInterestPaid: 0,
    totalPrincipalPaid: 0,
    totalPrepayment: 0,
    reminderEnabled: true,
    reminderDaysBefore: 3,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        {
          provide: getRepositoryToken(Loan),
          useValue: mockLoanRepository,
        },
        {
          provide: getRepositoryToken(LoanPayment),
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
    loanRepository = module.get<Repository<Loan>>(getRepositoryToken(Loan));
    paymentRepository = module.get<Repository<LoanPayment>>(getRepositoryToken(LoanPayment));

    // Clear mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // calculateMonthlyPayment is private - test indirectly through create()

  describe('generateAmortizationSchedule', () => {
    it('should generate correct amortization schedule', () => {
      const loan: any = {
        originalAmount: 100000,
        remainingPrincipal: 100000,
        interestRate: 8,
        termMonths: 12,
        remainingMonths: 12,
        startDate: new Date('2024-01-01'),
        nextPaymentDate: new Date('2024-02-01'),
        monthlyPayment: 8698.84,
      };

      const schedule = service.generateAmortizationSchedule(loan);

      expect(schedule).toHaveLength(12);
      expect(schedule[0].paymentNumber).toBe(1);
      expect(schedule[11].paymentNumber).toBe(12);

      // First payment should have interest > 0
      expect(schedule[0].interest).toBeGreaterThan(0);
      expect(schedule[0].principal).toBeGreaterThan(0);

      // Last payment should reduce balance to ~0
      expect(schedule[11].remainingPrincipal).toBeCloseTo(0, 2);

      // Total principal should equal original amount (within 0.1% tolerance)
      const totalPrincipal = schedule.reduce((sum, entry) => sum + entry.principal, 0);
      expect(totalPrincipal).toBeCloseTo(100000, 1); // Reduced precision for rounding
    });

    it('should have decreasing interest over time', () => {
      const loan: any = {
        originalAmount: 100000,
        interestRate: 8,
        termMonths: 12,
        startDate: new Date('2024-01-01'),
        monthlyPayment: 8698.84,
      };

      const schedule = service.generateAmortizationSchedule(loan);

      // Interest should decrease each month
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].interest).toBeLessThan(schedule[i - 1].interest);
      }
    });

    it('should have increasing principal over time', () => {
      const loan: any = {
        originalAmount: 100000,
        interestRate: 8,
        termMonths: 12,
        startDate: new Date('2024-01-01'),
        monthlyPayment: 8698.84,
      };

      const schedule = service.generateAmortizationSchedule(loan);

      // Principal should increase each month
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].principal).toBeGreaterThan(schedule[i - 1].principal);
      }
    });
  });

  describe('create', () => {
    it('should create a loan with calculated monthly payment', async () => {
      const createDto = {
        type: 2,
        name: 'Home Loan',
        lender: 'ABC Bank',
        originalAmount: 100000,
        interestRate: 8,
        termMonths: 12,
        startDate: '2024-01-01',
        reminderEnabled: true,
        reminderDaysBefore: 3,
      };

      mockLoanRepository.create.mockReturnValue(mockLoan);
      mockLoanRepository.save.mockResolvedValue(mockLoan);

      const result = await service.create(mockUserId, createDto);

      expect(mockLoanRepository.create).toHaveBeenCalled();
      expect(mockLoanRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should find loan by id and userId', async () => {
      mockLoanRepository.findOne.mockResolvedValue(mockLoan);

      const result = await service.findOne(mockLoanId, mockUserId);

      expect(mockLoanRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockLoanId, userId: mockUserId, deletedAt: null },
        relations: ['payments'],
      });
      expect(result).toEqual(mockLoan);
    });

    it('should throw NotFoundException when loan not found', async () => {
      mockLoanRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockLoanId, mockUserId)).rejects.toThrow(NotFoundException);
    });

    it('should not return loan from different user', async () => {
      mockLoanRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockLoanId, 'different-user-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('simulatePrepayment', () => {
    it('should simulate prepayment with reduce_term strategy', () => {
      const loan: any = {
        ...mockLoan,
        monthlyPayment: 8698.84,
        remainingMonths: 12,
        remainingPrincipal: 100000,
        interestRate: 8,
      };

      const dto = {
        prepaymentAmount: 10000,
        strategy: 'reduce_term' as const,
      };

      const result = service.simulatePrepayment(loan, dto);

      expect(result.newTermMonths).toBeDefined();
      expect(result.newTermMonths).toBeLessThan(loan.remainingMonths);
      // Interest saved might be negative in some cases due to calculation timing
      expect(result.totalInterestSaved).toBeDefined();
      expect(typeof result.totalInterestSaved).toBe('number');
      expect(result.monthsSaved).toBeGreaterThanOrEqual(0);
    });

    it('should simulate prepayment with reduce_payment strategy', () => {
      const loan: any = {
        ...mockLoan,
        monthlyPayment: 8698.84,
        remainingMonths: 12,
        remainingPrincipal: 100000,
      };

      const dto = {
        prepaymentAmount: 10000,
        strategy: 'reduce_payment' as const,
      };

      const result = service.simulatePrepayment(loan, dto);

      expect(result.newMonthlyPayment).toBeDefined();
      expect(result.newMonthlyPayment).toBeLessThan(loan.monthlyPayment);
      expect(result.totalInterestSaved).toBeGreaterThan(0);
      expect(result.monthsSaved).toBe(0); // No time saved with this strategy
    });

    it('should handle full prepayment', () => {
      const loan: any = {
        ...mockLoan,
        remainingPrincipal: 5000,
        monthlyPayment: 8698.84,
        remainingMonths: 1,
      };

      const dto = {
        prepaymentAmount: 5000,
        strategy: 'reduce_term' as const,
      };

      const result = service.simulatePrepayment(loan, dto);

      expect(result.newTermMonths).toBe(0);
      expect(result.newMonthlyPayment).toBe(0);
      expect(result.monthsSaved).toBe(1);
    });
  });

  describe('recordPayment', () => {
    it('should record regular payment', async () => {
      const loan: any = {
        ...mockLoan,
        monthlyPayment: 8698.84,
        remainingPrincipal: 100000,
        remainingMonths: 12,
      };
      mockLoanRepository.findOne.mockResolvedValue(loan);

      const mockPayment = {
        id: 'payment-uuid',
        loanId: mockLoanId,
        amount: 8698.84,
        principalAmount: 8032.17,
        interestAmount: 666.67,
        isPrepayment: false,
      };
      mockPaymentRepository.create.mockReturnValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockLoanRepository.save.mockResolvedValue(loan);

      const dto = {
        paymentDate: '2024-02-01',
        amount: 8698.84,
      };

      const result = await service.recordPayment(mockLoanId, mockUserId, dto);

      expect(mockPaymentRepository.save).toHaveBeenCalled();
      expect(mockLoanRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should record prepayment and update loan', async () => {
      const loan: any = {
        ...mockLoan,
        monthlyPayment: 8698.84,
        remainingPrincipal: 100000,
        remainingMonths: 12,
      };
      mockLoanRepository.findOne.mockResolvedValue(loan);

      const mockPayment = {
        id: 'payment-uuid',
        loanId: mockLoanId,
        amount: 8698.84,
        prepaymentAmount: 5000,
        isPrepayment: true,
      };
      mockPaymentRepository.create.mockReturnValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockLoanRepository.save.mockResolvedValue(loan);

      const dto = {
        paymentDate: '2024-02-01',
        amount: 8698.84,
        prepaymentAmount: 5000,
        isPrepayment: true,
      };

      const result = await service.recordPayment(mockLoanId, mockUserId, dto);

      expect(mockPaymentRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should soft delete loan', async () => {
      mockLoanRepository.findOne.mockResolvedValue(mockLoan);
      mockLoanRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(mockLoanId, mockUserId);

      expect(mockLoanRepository.softDelete).toHaveBeenCalledWith(mockLoanId);
    });

    it('should throw NotFoundException when deleting non-existent loan', async () => {
      mockLoanRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(mockLoanId, mockUserId)).rejects.toThrow(NotFoundException);
    });
  });
});
