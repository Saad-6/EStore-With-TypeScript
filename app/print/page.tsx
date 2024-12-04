import React from 'react';

export default function ExamAnswers() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Coal Assignment 2</h1>
        <p className="text-xl mt-2">Name: Muhammad Saad Nasir</p>
        <p className="text-xl">Reg No: 4450</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Question #1</h2>
          <p className="mb-4">The instruction fetch-execute cycle for the instruction "a = (b / c)" where b=2 and c=3, available at memory address 040042H, proceeds as follows:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Fetch:</strong>
              <ul className="list-disc list-inside ml-4">
                <li>Program Counter (PC) contains 040042H</li>
                <li>Address sent to Memory Address Register (MAR)</li>
                <li>Control unit sends read signal to memory</li>
                <li>Instruction fetched to Memory Buffer Register (MBR)</li>
                <li>Instruction moved to Instruction Register (IR)</li>
              </ul>
            </li>
            <li><strong>Decode:</strong> Control unit decodes the instruction in IR</li>
            <li><strong>Operand Fetch:</strong> Values of b (2) and c (3) fetched from memory</li>
            <li><strong>Execute:</strong> ALU performs division: 2 / 3</li>
            <li><strong>Store:</strong> Result stored in memory location for variable 'a'</li>
            <li><strong>Increment:</strong> PC incremented to next instruction</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Question #2</h2>
          <p className="mb-4">Designing cache memory to improve processor performance involves addressing these issues:</p>
          <ol className="list-decimal list-inside space-y-4">
            <li><strong>When cache is full and new block needs to be moved from main memory:</strong>
              <ul className="list-disc list-inside ml-4">
                <li>Implement replacement policy (e.g., LRU, FIFO, Random)</li>
                <li>Maintain usage information for cache blocks</li>
              </ul>
            </li>
            <li><strong>When data in cache block changes:</strong>
              <ul className="list-disc list-inside ml-4">
                <li>Implement write policy: Write-Through or Write-Back</li>
                <li>Use "dirty bit" to track modified blocks</li>
              </ul>
            </li>
            <li><strong>When CPU reads from cache and word is unavailable:</strong>
              <ul className="list-disc list-inside ml-4">
                <li>Implement miss handling procedure</li>
                <li>Fetch entire block from main memory</li>
                <li>Update cache tags and status bits</li>
                <li>Consider prefetching techniques</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Question #3</h2>
          <p className="mb-4">Memory cells and logic gates are fundamental components in modern computers:</p>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">Memory Cells:</h3>
              <ul className="list-disc list-inside ml-4">
                <li>Role: Store binary information</li>
                <li>Requirements: State retention, fast operations, low power, high density</li>
                <li>Examples: SRAM cells for cache, DRAM cells for main memory</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Logic Gates:</h3>
              <ul className="list-disc list-inside ml-4">
                <li>Role: Perform basic logical operations</li>
                <li>Requirements: Fast switching, low power, multiple output drive</li>
                <li>Examples: AND, OR, NOT, NAND, NOR gates</li>
              </ul>
            </div>
            <p>These components are crucial in developing various parts of modern computers, including processors, memory systems, I/O controllers, and GPUs.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Question #4</h2>
          <p className="mb-4">To balance performance between major components of a computer system, consider these factors:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Processor-Memory Balance:</strong> Multi-level caches, high-bandwidth interfaces</li>
            <li><strong>I/O Subsystem Performance:</strong> DMA, high-speed buses, I/O coprocessors</li>
            <li><strong>Storage System Optimization:</strong> Mix of technologies, intelligent caching, RAID</li>
            <li><strong>Parallel Processing:</strong> Multi-core processors, specialized co-processors</li>
            <li><strong>Power and Thermal Management:</strong> DVFS, efficient cooling, power-gating</li>
            <li><strong>Software Optimization:</strong> Compiler optimizations, JIT compilation</li>
            <li><strong>Interconnect Optimization:</strong> High-speed interconnects, efficient NoC designs</li>
          </ol>
          <p className="mt-4">Implementing these factors ensures improved overall system performance while maintaining balance between components.</p>
        </section>
      </div>
    </div>
  );
}