import { render, screen } from '../../test-utils';
import StatusBadge from '../ui/StatusBadge';

describe('StatusBadge Component', () => {
  it('should render with new status', () => {
    render(<StatusBadge status="new" />);
    
    const badge = screen.getByText('new');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-sky-100');
    expect(badge).toHaveClass('text-sky-700');
  });

  it('should render with contacted status', () => {
    render(<StatusBadge status="contacted" />);
    
    const badge = screen.getByText('contacted');
    expect(badge).toHaveClass('bg-indigo-100');
    expect(badge).toHaveClass('text-indigo-700');
  });

  it('should render with qualified status', () => {
    render(<StatusBadge status="qualified" />);
    
    const badge = screen.getByText('qualified');
    expect(badge).toHaveClass('bg-emerald-100');
    expect(badge).toHaveClass('text-emerald-700');
  });

  it('should render with negotiation status', () => {
    render(<StatusBadge status="negotiation" />);
    
    const badge = screen.getByText('negotiation');
    expect(badge).toHaveClass('bg-amber-100');
    expect(badge).toHaveClass('text-amber-700');
  });

  it('should render with closed status', () => {
    render(<StatusBadge status="closed" />);
    
    const badge = screen.getByText('closed');
    expect(badge).toHaveClass('bg-gray-200');
    expect(badge).toHaveClass('text-gray-800');
  });

  it('should render with lost status', () => {
    render(<StatusBadge status="lost" />);
    
    const badge = screen.getByText('lost');
    expect(badge).toHaveClass('bg-rose-100');
    expect(badge).toHaveClass('text-rose-700');
  });

  it('should handle unknown status with default styling', () => {
    render(<StatusBadge status="unknown" />);
    
    const badge = screen.getByText('unknown');
    expect(badge).toHaveClass('bg-sky-100');
    expect(badge).toHaveClass('text-sky-700');
  });

  it('should handle empty status', () => {
    render(<StatusBadge status="" />);
    
    const badge = screen.getByText('new');
    expect(badge).toHaveClass('bg-sky-100');
  });

  it('should handle undefined status', () => {
    render(<StatusBadge status={undefined as any} />);
    
    const badge = screen.getByText('new');
    expect(badge).toHaveClass('bg-sky-100');
  });

  it('should accept custom className', () => {
    render(<StatusBadge status="new" className="custom-class" />);
    
    const badge = screen.getByText('new');
    expect(badge).toHaveClass('custom-class');
  });

  it('should capitalize status text', () => {
    render(<StatusBadge status="NEW" />);
    
    const badge = screen.getByText('NEW');
    expect(badge).toHaveClass('capitalize');
  });

  it('should have proper accessibility attributes', () => {
    render(<StatusBadge status="new" />);
    
    const badge = screen.getByText('new');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('py-0.5');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-medium');
  });
});
