'use client';

import { useQuery } from '@tanstack/react-query';
import { Briefcase, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { useCallback, useState } from 'react';
import Tree from 'react-d3-tree';

import api from '@/lib/axios';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import useAuthStore from '@/store/useAuthStore';

import { API_BASE_URL } from '@/constant/config';

import { ApiReturn } from '@/types/api.types';
import { RoleMapResponse } from '@/types/response/ai';

// Define types for our data
interface TreeNode {
  name: string;
  id: string;
  level: string;
  timeline: string;
  skills: string[];
  children: TreeNode[];
  attributes?: {
    level: string;
  };
}

// Function to build the tree structure from flat data
const buildTree = (data: RoleMapResponse[]): TreeNode => {
  // Find the root node (with empty ParentRole)
  let rootRole = data.find((role) => role.ParentRole === '');

  // If no root role is found, create a virtual root node
  if (!rootRole) {
    // Find all roles that don't have a parent within the dataset
    const potentialRoots = data.filter(
      (role) => !data.some((r) => r.Role === role.ParentRole)
    );

    // If we have potential roots, use the first one as the main root
    // or find the one with most children
    if (potentialRoots.length > 0) {
      // Optional: Find the potential root with the most children
      const rootsWithChildrenCount = potentialRoots.map((role) => ({
        role,
        childCount: data.filter((r) => r.ParentRole === role.Role).length,
      }));

      rootsWithChildrenCount.sort((a, b) => b.childCount - a.childCount);
      rootRole = rootsWithChildrenCount[0].role;
    } else {
      // If we still can't find a good root, use the first role as root
      rootRole = data[0];
    }
  }

  // Recursive function to build the tree
  const buildNode = (role: RoleMapResponse): TreeNode => {
    const children = data
      .filter((r) => r.ParentRole === role.Role)
      .map((childRole) => buildNode(childRole));

    return {
      name: role.Role,
      id: role.ID,
      level: role.Level,
      timeline: role.Timeline,
      skills: JSON.parse(role.SkillsNeeded),
      children,
      attributes: {
        level: role.Level,
      },
    };
  };

  return buildNode(rootRole);
};

const buildForest = (data: RoleMapResponse[]): TreeNode => {
  // Find the roots - roles that don't have a parent within the dataset
  const rootRoles = data.filter(
    (role) => !data.some((r) => r.Role === role.ParentRole)
  );

  // Create a virtual root to contain all trees
  const virtualRoot: TreeNode = {
    name: 'Career Paths',
    id: 'virtual-root',
    level: 'root',
    timeline: '',
    skills: [],
    children: [],
    attributes: {
      level: 'root',
    },
  };

  // Build each tree in the forest
  for (const rootRole of rootRoles) {
    // Recursive function to build each node
    const buildNode = (role: RoleMapResponse): TreeNode => {
      const children = data
        .filter((r) => r.ParentRole === role.Role)
        .map((childRole) => buildNode(childRole));

      return {
        name: role.Role,
        id: role.ID,
        level: role.Level,
        timeline: role.Timeline,
        skills: JSON.parse(role.SkillsNeeded),
        children,
        attributes: {
          level: role.Level,
        },
      };
    };

    // Add this tree to the virtual root
    virtualRoot.children.push(buildNode(rootRole));
  }

  return virtualRoot;
};

export default function CareerTreePage() {
  const { user } = useAuthStore();
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>(
    'vertical'
  );
  const [viewMode, setViewMode] = useState<'single' | 'forest'>('forest');
  const [treeHeight, setTreeHeight] = useState(600);
  const [zoomLevel, setZoomLevel] = useState(0.7);

  // Adjust tree container height on window resize
  const updateDimensions = useCallback(() => {
    // Adjust height based on viewport
    const isMobile = window.innerWidth < 768;
    setTreeHeight(isMobile ? 400 : 600);
    setZoomLevel(isMobile ? 0.5 : 0.7);
  }, []);

  // Set up event listeners when component mounts
  useState(() => {
    // Update dimensions on mount
    updateDimensions();

    // Add event listener for window resize
    window.addEventListener('resize', updateDimensions);

    // Clean up
    return () => window.removeEventListener('resize', updateDimensions);
  });

  const { data, isPending, error } = useQuery<RoleMapResponse[]>({
    queryKey: ['careerTree'],
    queryFn: async () => {
      const response = await api.get<ApiReturn<RoleMapResponse[]>>(
        `${API_BASE_URL}/career-tree/${user?.email}`
      );
      return response.data.data;
    },
  });

  // Get level counts for the legend
  const getLevelCounts = (data: RoleMapResponse[] | undefined) => {
    if (!data) return { entry: 0, mid: 0, senior: 0, expert: 0 };

    const counts: Record<string, number> = {
      entry: 0,
      mid: 0,
      senior: 0,
      expert: 0,
    };

    data.forEach((role) => {
      if (counts[role.Level] !== undefined) {
        counts[role.Level]++;
      }
    });

    return counts;
  };

  const levelCounts = getLevelCounts(data);

  // Get tree data based on the mode
  const getTreeData = () => {
    if (!data || data.length === 0) return null;

    return viewMode === 'single' ? buildTree(data) : buildForest(data);
  };

  // Handle orientation change with keyboard support
  const handleOrientationChange = (
    newOrientation: 'vertical' | 'horizontal'
  ) => {
    setOrientation(newOrientation);
  };

  // Handle view mode change with keyboard support
  const handleViewModeChange = (newMode: 'single' | 'forest') => {
    setViewMode(newMode);
  };

  // Custom node component for the tree with accessibility improvements
  const renderCustomNodeElement = ({ nodeDatum, toggleNode }: any) => {
    const levelColors = {
      entry: 'bg-blue-100 text-blue-800 border-blue-300',
      mid: 'bg-green-100 text-green-800 border-green-300',
      senior: 'bg-amber-100 text-amber-800 border-amber-300',
      expert: 'bg-purple-100 text-purple-800 border-purple-300',
      root: 'bg-gray-100 text-gray-800 border-gray-300 opacity-80', // For virtual root
    };

    const colorClass =
      levelColors[nodeDatum.level as keyof typeof levelColors] ||
      'bg-gray-100 text-gray-800 border-gray-300';

    // Hide the virtual root or make it small and discrete
    if (nodeDatum.id === 'virtual-root') {
      return (
        <g>
          <foreignObject width={0} height={0} x={0} y={0}>
            <div aria-hidden='true'></div>
          </foreignObject>
        </g>
      );
    }

    // Create accessible label
    const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
    const expandCollapseText = nodeDatum.__rd3t.collapsed
      ? 'Expand to show child roles'
      : 'Collapse child roles';
    const ariaLabel = `${nodeDatum.name}, ${
      nodeDatum.level
    } level role, timeline ${nodeDatum.timeline}${
      hasChildren ? '. ' + expandCollapseText : ''
    }`;

    return (
      <g>
        <foreignObject width={200} height={100} x={-100} y={-50}>
          <div
            className={`p-2 rounded-lg border-2 ${colorClass} shadow-md cursor-pointer transition-all hover:shadow-lg hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            onClick={() => {
              toggleNode();
              setSelectedNode(nodeDatum);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleNode();
                setSelectedNode(nodeDatum);
              }
            }}
            role='button'
            tabIndex={0}
            aria-label={ariaLabel}
          >
            <div className='font-medium text-sm truncate'>{nodeDatum.name}</div>
            <div
              className='text-xs flex items-center mt-1'
              aria-label={`Timeline: ${nodeDatum.timeline}`}
            >
              <Clock className='h-3 w-3 mr-1' aria-hidden='true' />
              {nodeDatum.timeline}
            </div>
            <div className='flex items-center justify-center mt-2'>
              {hasChildren && (
                <div className='text-xs flex items-center' aria-hidden='true'>
                  {nodeDatum.__rd3t.collapsed ? (
                    <ChevronRight className='h-4 w-4' />
                  ) : (
                    <ChevronDown className='h-4 w-4' />
                  )}
                </div>
              )}
            </div>
          </div>
        </foreignObject>
      </g>
    );
  };

  // Loading state with accessibility
  if (isPending) {
    return (
      <div
        className='flex justify-center items-center min-h-screen'
        role='status'
      >
        <div className='animate-pulse'>
          <div className='text-lg font-medium'>Loading career path data...</div>
          <div className='mt-2 text-sm text-gray-500'>
            Please wait while we retrieve your career information
          </div>
        </div>
      </div>
    );
  }

  // Error state with accessibility
  if (error) {
    return (
      <div
        className='flex justify-center items-center min-h-screen'
        role='alert'
      >
        <div className='bg-red-50 p-6 rounded-lg border border-red-200 max-w-md'>
          <h2 className='text-lg font-medium text-red-800'>
            Error Loading Data
          </h2>
          <p className='mt-2 text-sm text-red-700'>
            Unable to load career path data. Please try again later.
          </p>
          <button
            className='mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
            onClick={() => window.location.reload()}
            aria-label='Refresh page'
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const treeData = getTreeData();
  if (!treeData) {
    return (
      <div
        className='flex justify-center items-center min-h-screen'
        role='status'
      >
        <div className='bg-yellow-50 p-6 rounded-lg border border-yellow-200 max-w-md'>
          <h2 className='text-lg font-medium text-yellow-800'>
            No Career Data Available
          </h2>
          <p className='mt-2 text-sm text-yellow-700'>
            We couldn't find any career path data for your profile. This could
            be because your profile is new or your career paths haven't been
            generated yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className='min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8'>
        {/* Descriptive headings improve screen reader navigation */}
        <h1 className='sr-only'>Career Path Visualization Tool</h1>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 bg-white rounded-lg border shadow-sm'>
            <div className='p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <h2
                className='font-semibold text-lg'
                id='tree-visualization-title'
              >
                Career Path Visualization
              </h2>
              <div className='flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-2 w-full sm:w-auto'>
                {/* Accessible tab controls */}
                <fieldset className='w-full sm:w-auto'>
                  <legend className='sr-only'>Select tree orientation</legend>
                  <Tabs>
                    <TabsList>
                      <TabsTrigger
                        value='vertical'
                        onClick={() => handleOrientationChange('vertical')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOrientationChange('vertical');
                          }
                        }}
                        aria-pressed={orientation === 'vertical'}
                        className={
                          orientation === 'vertical'
                            ? 'bg-primary text-primary-foreground'
                            : ''
                        }
                      >
                        Vertical
                      </TabsTrigger>
                      <TabsTrigger
                        value='horizontal'
                        onClick={() => handleOrientationChange('horizontal')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOrientationChange('horizontal');
                          }
                        }}
                        aria-pressed={orientation === 'horizontal'}
                        className={
                          orientation === 'horizontal'
                            ? 'bg-primary text-primary-foreground'
                            : ''
                        }
                      >
                        Horizontal
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </fieldset>

                <fieldset className='w-full sm:w-auto'>
                  <legend className='sr-only'>Select view mode</legend>
                  <Tabs className='ml-0 sm:ml-4'>
                    <TabsList>
                      <TabsTrigger
                        value='single'
                        onClick={() => handleViewModeChange('single')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleViewModeChange('single');
                          }
                        }}
                        aria-pressed={viewMode === 'single'}
                        className={
                          viewMode === 'single'
                            ? 'bg-primary text-primary-foreground'
                            : ''
                        }
                      >
                        Single Tree
                      </TabsTrigger>
                      <TabsTrigger
                        value='forest'
                        onClick={() => handleViewModeChange('forest')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleViewModeChange('forest');
                          }
                        }}
                        aria-pressed={viewMode === 'forest'}
                        className={
                          viewMode === 'forest'
                            ? 'bg-primary text-primary-foreground'
                            : ''
                        }
                      >
                        Multiple Trees
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </fieldset>
              </div>
            </div>
            {/* Add keyboard instructions for accessibility */}
            <div
              className='px-4 py-2 bg-gray-50 text-xs text-gray-600'
              aria-live='polite'
            >
              <p>
                <span className='font-medium'>Keyboard navigation:</span> Use
                Tab to navigate between nodes, Enter or Space to select a node
                and toggle children.
              </p>
            </div>
            <div
              className='w-full'
              style={{ height: `${treeHeight}px` }}
              aria-labelledby='tree-visualization-title'
              role='figure'
            >
              <Tree
                data={treeData}
                orientation={orientation}
                renderCustomNodeElement={renderCustomNodeElement}
                pathFunc='step'
                separation={{ siblings: 2, nonSiblings: 2 }}
                translate={{
                  x:
                    orientation === 'vertical'
                      ? window.innerWidth < 768
                        ? 200
                        : 400
                      : window.innerWidth < 768
                      ? 100
                      : 200,
                  y:
                    orientation === 'vertical'
                      ? 50
                      : window.innerWidth < 768
                      ? 200
                      : 300,
                }}
                zoom={zoomLevel}
                zoomable={true}
                collapsible={true}
                nodeSize={{
                  x: window.innerWidth < 768 ? 180 : 220,
                  y: window.innerWidth < 768 ? 100 : 120,
                }}
                scaleExtent={{ min: 0.3, max: 2 }}
              />
            </div>

            {/* Add zoom controls for better accessibility */}
            <div className='p-3 border-t flex justify-center gap-2'>
              <button
                onClick={() =>
                  setZoomLevel((prev) => Math.max(0.3, prev - 0.1))
                }
                className='px-3 py-1 bg-gray-100 rounded border hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                aria-label='Zoom out'
              >
                <span aria-hidden='true'>-</span>
              </button>
              <span className='px-3 py-1 text-sm' aria-live='polite'>
                Zoom: {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(2, prev + 0.1))}
                className='px-3 py-1 bg-gray-100 rounded border hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                aria-label='Zoom in'
              >
                <span aria-hidden='true'>+</span>
              </button>
            </div>
          </div>

          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle id='role-details-title'>Role Details</CardTitle>
                <CardDescription>
                  {selectedNode
                    ? `Information about ${selectedNode.name}`
                    : 'Select a role to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent aria-labelledby='role-details-title'>
                {selectedNode ? (
                  <div className='space-y-4'>
                    <div>
                      <h3 className='text-lg font-semibold'>
                        {selectedNode.name}
                      </h3>
                      <div className='flex items-center mt-1 text-sm text-muted-foreground'>
                        <Clock className='h-4 w-4 mr-1' aria-hidden='true' />
                        <span>{selectedNode.timeline}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className='text-sm font-medium mb-2'>Level</h4>
                      <Badge variant='outline' className='capitalize'>
                        {selectedNode.level}
                      </Badge>
                    </div>

                    <div>
                      <h4 className='text-sm font-medium mb-2' id='skills-list'>
                        Skills Needed
                      </h4>
                      <div
                        className='flex flex-wrap gap-2'
                        aria-labelledby='skills-list'
                      >
                        {selectedNode.skills.map((skill, index) => (
                          <Badge key={index} variant='secondary'>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4
                        className='text-sm font-medium mb-2'
                        id='potential-paths'
                      >
                        Potential Paths
                      </h4>
                      {selectedNode.children.length > 0 ? (
                        <ul
                          className='space-y-2'
                          aria-labelledby='potential-paths'
                        >
                          {selectedNode.children.map((child) => (
                            <li
                              key={child.id}
                              className='flex items-center text-sm'
                            >
                              <ChevronRight
                                className='h-4 w-4 mr-1 text-muted-foreground'
                                aria-hidden='true'
                              />
                              {child.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className='text-sm text-muted-foreground'>
                          No further progression paths defined
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-8 text-center text-muted-foreground'>
                    <Briefcase
                      className='h-12 w-12 mb-4 opacity-20'
                      aria-hidden='true'
                    />
                    <p>
                      Click on any role in the tree to view detailed information
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle id='level-distribution-title'>
                  Career Level Distribution
                </CardTitle>
                <CardDescription>
                  Number of roles at each career level
                </CardDescription>
              </CardHeader>
              <CardContent aria-labelledby='level-distribution-title'>
                <div className='space-y-3'>
                  {Object.entries(levelCounts).map(([level, count]) => {
                    // Calculate percentage
                    const percentage = data
                      ? Math.round((count / data.length) * 100)
                      : 0;

                    return (
                      <div key={level} className='flex items-center'>
                        <div className='w-24 capitalize'>{level}</div>
                        <div
                          className='flex-1 h-2 bg-gray-100 rounded-full overflow-hidden'
                          role='progressbar'
                          aria-valuenow={percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${level} level: ${count} roles (${percentage}%)`}
                        >
                          <div
                            className={`h-full rounded-full ${
                              level === 'entry'
                                ? 'bg-blue-500'
                                : level === 'mid'
                                ? 'bg-green-500'
                                : level === 'senior'
                                ? 'bg-amber-500'
                                : 'bg-purple-500'
                            }`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                        <div className='w-16 pl-2 text-left text-sm text-muted-foreground'>
                          {count} ({percentage}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle id='legend-title'>Legend</CardTitle>
              </CardHeader>
              <CardContent aria-labelledby='legend-title'>
                <div className='space-y-2'>
                  <div className='flex items-center'>
                    <div
                      className='w-4 h-4 rounded bg-blue-100 border border-blue-300 mr-2'
                      aria-hidden='true'
                    ></div>
                    <span className='text-sm'>Entry Level</span>
                  </div>
                  <div className='flex items-center'>
                    <div
                      className='w-4 h-4 rounded bg-green-100 border border-green-300 mr-2'
                      aria-hidden='true'
                    ></div>
                    <span className='text-sm'>Mid Level</span>
                  </div>
                  <div className='flex items-center'>
                    <div
                      className='w-4 h-4 rounded bg-amber-100 border border-amber-300 mr-2'
                      aria-hidden='true'
                    ></div>
                    <span className='text-sm'>Senior Level</span>
                  </div>
                  <div className='flex items-center'>
                    <div
                      className='w-4 h-4 rounded bg-purple-100 border border-purple-300 mr-2'
                      aria-hidden='true'
                    ></div>
                    <span className='text-sm'>Expert Level</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
