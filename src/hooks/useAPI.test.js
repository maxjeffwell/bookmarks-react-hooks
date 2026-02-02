import { renderHook, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import useAPI from './useAPI';

// Mock axios
jest.mock('axios');

// Suppress console.error for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe('useAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading true initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    const { result } = renderHook(() => useAPI('/api/test'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('fetches data successfully', async () => {
    const mockData = [{ id: 1, title: 'Test' }];
    axios.get.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useAPI('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('handles errors correctly', async () => {
    const mockError = new Error('Network error');
    axios.get.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useAPI('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toEqual(mockError);
  });

  it('does not fetch when enabled is false', async () => {
    const { result } = renderHook(() => useAPI('/api/test', false));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
  });

  it('provides refetch function that fetches again', async () => {
    const mockData1 = [{ id: 1, title: 'First' }];
    const mockData2 = [{ id: 2, title: 'Second' }];
    axios.get
      .mockResolvedValueOnce({ data: mockData1 })
      .mockResolvedValueOnce({ data: mockData2 });

    const { result } = renderHook(() => useAPI('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData1);

    // Call refetch wrapped in act
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});
