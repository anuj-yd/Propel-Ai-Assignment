const SpanDetector = require('../src/services/strategies/SpanDetector');
const poleRepository = require('../src/repositories/PoleRepository');

// Mock the pole repository
jest.mock('../src/repositories/PoleRepository');

describe('SpanDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new SpanDetector();
    jest.clearAllMocks();
  });

  test('should not detect fault if pole is energized', async () => {
    const telemetryData = { pole_id: 'P2', energized: true };
    const graph = {};
    const neighbours = ['P1', 'P3'];

    const result = await detector.detect(telemetryData, graph, neighbours);

    expect(result.detected).toBe(false);
    expect(result.type).toBe('SPAN_FAULT');
    expect(poleRepository.getPolesByIds).not.toHaveBeenCalled();
  });

  test('should detect boundary if there is exactly 1 live neighbour', async () => {
    const telemetryData = { pole_id: 'P2', energized: false };
    const graph = {};
    const neighbours = ['P1', 'P3'];

    // P1 is live (upstream), P3 is dark (downstream)
    poleRepository.getPolesByIds.mockResolvedValue([
      { poleId: 'P1', energized: true },
      { poleId: 'P3', energized: false }
    ]);

    const result = await detector.detect(telemetryData, graph, neighbours);

    expect(poleRepository.getPolesByIds).toHaveBeenCalledWith(neighbours);
    expect(result.detected).toBe(true);
    expect(result.boundary).toEqual(['P1', 'P2']);
    expect(result.details).toContain('Span broken between P1 and P2');
  });

  test('should treat as noise (dead sensor) if there are multiple live neighbours', async () => {
    const telemetryData = { pole_id: 'P2', energized: false };
    const graph = {};
    const neighbours = ['P1', 'P3', 'P4'];

    // P1, P3 are live
    poleRepository.getPolesByIds.mockResolvedValue([
      { poleId: 'P1', energized: true },
      { poleId: 'P3', energized: true },
      { poleId: 'P4', energized: false }
    ]);

    const result = await detector.detect(telemetryData, graph, neighbours);

    expect(result.detected).toBe(false);
    expect(result.boundary).toBeNull();
    expect(result.details).toBe('Normal or Noise');
  });

  test('should not detect boundary if there are 0 live neighbours (downstream fault symptom)', async () => {
    const telemetryData = { pole_id: 'P3', energized: false };
    const graph = {};
    const neighbours = ['P2', 'P4'];

    // Both neighbours are dark
    poleRepository.getPolesByIds.mockResolvedValue([
      { poleId: 'P2', energized: false },
      { poleId: 'P4', energized: false }
    ]);

    const result = await detector.detect(telemetryData, graph, neighbours);

    expect(result.detected).toBe(false);
    expect(result.boundary).toBeNull();
  });
});
