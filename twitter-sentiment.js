'use strict'; //treat silly mistakes as run-time errors
/**
@Author: Akshay Singh
This a sentiment analysis tool that conducts sentiment analysis on tweets from Twitter's public search API. 
**/
var globalTweets;
//console.log(_DOG_TWEETS);
var parseTweets=function(jsonObject){
	var tweets=[];
	//Looping through array of objects
	for(var i=0;i<jsonObject.statuses.length;i++)
	{
		var tweet=jsonObject['statuses'][i];
		var hashTags=tweet['entities']['hashtags'];
		var textString=[];
		//Getting each string in a hashString into an array
		for(var j=0;j<hashTags.length;j++)
		{
			textString.push(hashTags[j]['text']);
		}
		//Creating a tweet object
		tweets.push({
			created_at: tweet['created_at'],
			screen_name: tweet['user']['name'],
			textContent: tweet['text'],
			retweet_count: tweet['retweet_count'],
			hashTag: textString,
			sentiment:0
		});
	}
	globalTweets=tweets;
	return tweets;
}
//Loading tweets using promise callbacks
var loadTweets=function(filepath){
	return $.getJSON(filepath).then(parseTweets);
}

//Function to create table with tweet data
var showTweets=function(jsonObject){
	//Resetting the table
	$('#tweetTable').empty();
	for(var  i=0;i<jsonObject.length;i++)
	{
		//Converting date to appropriate format
		var date = new Date(jsonObject[i].created_at); //creating a date object  
		var created_at = date.toUTCString();
		var tableString='<tr><td>'+jsonObject[i]['screen_name']+'</td>'
		+'<td>'+created_at
		+'</td><td>'+jsonObject[i]['textContent']
		+'</td><td>'+jsonObject[i]['hashTag'].join(',')
		+'</td><td>'+jsonObject[i]['retweet_count']
		+'</td><td>'+jsonObject[i]['sentiment']
		+'</td></tr>';
		//Appending each row to table iteratively
		$('#tweetTable').append(tableString);
	}
}

//Function to parse csv sentiment data
var parseSentiments=function(data){
	var words=[];
	//Splitting into rows
	var rowArray=data.split('\n');
	//From array of rows, extracting 2 words each
	for(var i=0;i<rowArray.length;i++)
	{
		//Splitting by comma
		var word=rowArray[i].split(',');
		var wordObject={};
		var key=word[0];	
		var value=parseInt(word[1]);
		wordObject[key]=value;
		//Pushing word and sentiment into word array
		words.push(wordObject);
	}
	return words;
}

//Function to calculate sentiment of a string based on the dictionary data created in the function above
var textSentiment=function(string,sentiments){
	//Split setring into words
	var wordArray=string.split(" ");
	var sumOfSentiments=0;
	//For each word
	for(var i=0;i<wordArray.length;i++)
	{
		//Looping through dictionary
		for(var j=0;j<sentiments.length;j++)
		{
			//If the entry exists
			if(sentiments[j][wordArray[i]])
			{
				//Add to the overall sum of sentiments
				sumOfSentiments+=sumOfSentiments+sentiments[j][wordArray[i]];
			}
		}
	}
	return sumOfSentiments
}

//Loading sentiment data, returning promise object and then calling parseSentiment on the data returned by the promise
var loadSentiments=function(filepath){
	var promise=$.get(filepath);
	return promise.then(parseSentiments);
}

//Function to call both loadTweets & loadSentiments and then returning the data from the promise to process it
var tweetSentiments=function(tweetFile,sentimentFile)
{
	var tweetFileFn=loadTweets(tweetFile);
	var sentimentFileFn=loadSentiments(sentimentFile);
	$.when(tweetFileFn,sentimentFileFn).then(function(tweetData,sentimentData)
	{
		console.log(tweetData);
		var sumOfSentiments=0;
		//Iterating through tweets
		for(var i=0;i<tweetData.length;i++)
		{
			//For each line in the text update sentimentScore
			var sentimentScore=textSentiment(tweetData[i]['textContent'],sentimentData);
			//Update new sentiment score for the original object
			tweetData[i]['sentiment']=sentimentScore;
		}
		//Call showTweet for each tweet
		showTweets(tweetData);
	});
}

$('#searchButton').click(function(){ //Event for handling clicking on the button 
    var searchText = $('#searchBox').val(); //Value in search field
    var url = 'http://faculty.washington.edu/joelross/search-tweets-proxy/?q='+searchText+'&count=100';  //forming url to request tweet data
    tweetSentiments(url, 'data/AFINN-111.csv'); // calling the tweetSentiments function to display the tweets on webpage   
});

/*Sort by sentiments*/
$('#sentimentHeader').click(function(){
    globalTweets.sort(function(x, y){
        return parseFloat(y.sentiment)-parseFloat(x.sentiment);   
    })
    showTweets(globalTweets);
})

/*Sort retweets*/
$('#retweetHeader').click(function(){
    globalTweets.sort(function(x, y){
        return parseFloat(y.retweet_count)-parseFloat(x.retweet_count);   
    })
    showTweets(globalTweets);
})