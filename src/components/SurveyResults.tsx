import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Survey {
  id: number;
  title: string;
}

interface SurveyResponse {
  id: number;
  answers: Record<string, string | string[]>;
  email: string;
  name: string;
  can_contact: boolean;
  created_at: string;
  survey_id: number;
}

interface SurveyResultsProps {
  surveys: Survey[];
}

export function SurveyResults({ surveys }: SurveyResultsProps) {
  const [results, setResults] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [selectedSurveyId, setSelectedSurveyId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchResults() {
      if (!selectedSurveyId) return;
      
      try {
        setLoading(true);
        console.log('Fetching results for survey ID:', selectedSurveyId);
        const { data, error } = await supabase
          .from('survey_responses')
          .select('*')
          .eq('survey_id', selectedSurveyId)
          .order('created_at', { ascending: false });

        console.log('Supabase response:', { data, error });

        if (error) throw error;
        setResults(data || []);
        console.log('Fetched results:', data);
      } catch (err) {
        console.error('Error in fetchResults:', err);
        setError('Failed to fetch survey results');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [selectedSurveyId]);

  if (error) return <div>Error: {error}</div>;

  const ResponseCard = ({ response }: { response: SurveyResponse }) => (
    <Card 
      className="mb-4 cursor-pointer hover:shadow-lg transition-shadow bg-white"
      onClick={() => setSelectedResponse(response)}
    >
      <CardHeader>
        <CardTitle className="text-xl text-indigo-700">{response.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Email: {response.email}</p>
        <p className="text-gray-600">Submitted: {new Date(response.created_at).toLocaleString()}</p>
      </CardContent>
    </Card>
  );

  const DetailedResponseView = ({ response }: { response: SurveyResponse }) => (
    <Card className="mb-4 bg-white">
      <CardHeader>
        <CardTitle className="text-2xl text-indigo-700">{response.name}'s Response</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">Email: {response.email}</p>
        <p className="text-gray-600">Can Contact: {response.can_contact ? 'Yes' : 'No'}</p>
        <p className="text-gray-600">Submitted: {new Date(response.created_at).toLocaleString()}</p>
        <h3 className="font-bold text-lg text-indigo-700 mt-4 mb-2">Answers:</h3>
        {Object.entries(response.answers).map(([question, answer]) => (
          <div key={question} className="mb-2 p-2 bg-gray-100 rounded">
            <p className="font-semibold">{question}</p>
            <p className="text-gray-600">{Array.isArray(answer) ? answer.join(', ') : answer}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Select
        value={selectedSurveyId?.toString() || ''}
        onValueChange={(value) => {
          setSelectedSurveyId(Number(value));
          setSelectedResponse(null);
        }}
      >
        <SelectTrigger className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
          <SelectValue placeholder="Select a survey" />
        </SelectTrigger>
        <SelectContent>
          {surveys.map((survey) => (
            <SelectItem key={survey.id} value={survey.id.toString()}>
              {survey.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : selectedResponse ? (
        <>
          <Button onClick={() => setSelectedResponse(null)} className="mb-4 bg-indigo-600 hover:bg-indigo-700 text-white">Back to Results</Button>
          <DetailedResponseView response={selectedResponse} />
        </>
      ) : selectedSurveyId ? (
        results.length === 0 ? (
          <p className="text-center text-gray-600">No results found for this survey</p>
        ) : (
          results.map((response) => (
            <ResponseCard key={response.id} response={response} />
          ))
        )
      ) : (
        <p className="text-center text-gray-600">Please select a survey to view results</p>
      )}
    </div>
  );
}