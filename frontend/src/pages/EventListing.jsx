import { useQuery } from '@tanstack/react-query';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Calendar,
    Grid,
    List,
    MapPin,
    Search,
    Users
} from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';

const EventListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'date');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Build fetch function using axios params option to avoid manual query strings
  const fetchEvents = async () => {
    const params = {
      page: page.toString(),
      limit: '12',
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(selectedCategory !== 'all' ? { category: selectedCategory } : {}),
      sortBy,
    };

    const response = await api.get('/events', { params });
    return response.data;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['events', searchTerm, selectedCategory, sortBy, page],
    queryFn: () => fetchEvents(),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'concert', label: 'Concert' },
    { value: 'sports', label: 'Sports' },
    { value: 'exhibition', label: 'Exhibition' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date (Earliest First)' },
    { value: '-date', label: 'Date (Latest First)' },
    { value: 'price', label: 'Price (Low to High)' },
    { value: '-price', label: 'Price (High to Low)' },
    { value: 'title', label: 'Name (A to Z)' },
    { value: '-title', label: 'Name (Z to A)' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
    setPage(1);
    updateURL();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
    updateURL();
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPage(1);
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (sortBy !== 'date') params.set('sortBy', sortBy);
    setSearchParams(params);
  };

  const getEventStatus = (eventDate) => {
    const now = startOfDay(new Date());
    const event = startOfDay(new Date(eventDate));
    
    if (isBefore(event, now)) return 'past';
    if (isAfter(event, now)) return 'upcoming';
    return 'today';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'past': return 'bg-gray-500';
      case 'today': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'past': return 'Past Event';
      case 'today': return 'Today';
      case 'upcoming': return 'Upcoming';
      default: return 'Unknown';
    }
  };

  if (error) {
    const serverMessage = error?.response?.data?.message || error?.message || 'Something went wrong while loading events.';
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Events</h2>
          <p className="text-gray-600 mb-4">{serverMessage}</p>
          <button 
            onClick={() => refetch()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Events</h1>
          <p className="text-xl text-gray-600">
            Find amazing events happening around you
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events, locations, or organizers..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-64">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {data?.events?.length || 0} of {data?.total || 0} events
              </p>
            </div>

            {/* Events Grid/List */}
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {data?.events?.map((event, index) => {
                    const status = getEventStatus(event.date);
                    return (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group"
                      >
                        <Link to={`/events/${event._id}`}>
                          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <div className="relative">
                              <img
                                src={event.img}
                                alt={event.title}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(status)}`}>
                                  {getStatusText(status)}
                                </span>
                              </div>
                              <div className="absolute top-4 right-4">
                                <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-medium text-gray-900">
                                  ${event.price}
                                </span>
                              </div>
                            </div>
                            <div className="p-6">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                                {event.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {event.description}
                              </p>
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-500 text-sm">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  {format(new Date(event.date), 'MMM dd, yyyy • h:mm a')}
                                </div>
                                <div className="flex items-center text-gray-500 text-sm">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  {event.location}
                                </div>
                                <div className="flex items-center text-gray-500 text-sm">
                                  <Users className="w-4 h-4 mr-2" />
                                  {event.availableSeats} seats available
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {data?.events?.map((event, index) => {
                    const status = getEventStatus(event.date);
                    return (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group"
                      >
                        <Link to={`/events/${event._id}`}>
                          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <div className="flex flex-col md:flex-row">
                              <div className="relative md:w-80 h-48 md:h-auto">
                                <img
                                  src={event.img}
                                  alt={event.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-4 left-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(status)}`}>
                                    {getStatusText(status)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                                    {event.title}
                                  </h3>
                                  <span className="text-2xl font-bold text-primary-600">
                                    ${event.price}
                                  </span>
                                </div>
                                <p className="text-gray-600 mb-4 line-clamp-2">
                                  {event.description}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {format(new Date(event.date), 'MMM dd, yyyy • h:mm a')}
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {event.location}
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    {event.availableSeats} seats available
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {data?.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {[...Array(data.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 border rounded-lg ${
                        page === i + 1
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* No Results */}
            {data?.events?.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No events found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or browse all events.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSortBy('date');
                    setPage(1);
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventListing;
