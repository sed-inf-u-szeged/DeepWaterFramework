import os
import csv
import fstrategies

class FeatureMerger:
    def __init__(self, strategy):
        self._strategies = strategy.split('+')
        
    def embed(self, args, sargs_list):
        embed_csv_list = list()
        for (strategy, sargs) in zip(self._strategies, sargs_list):
            try:
                # Learn the embeddings with all the strategies than combine the resulting csv, save it and return the path to it
                feature_vector_strategy = getattr(fstrategies, strategy)
                embed_csv_list.append(feature_vector_strategy.embed(args, sargs))
            except AttributeError as e:
                logger.error("Can't find strategy '%s'." % (strategy))
                sys.exit(-1)
        csv_readers = list()
        label_cols = list()
        header_row = list()
        csv_name = ""
        for embed_csv in embed_csv_list:
            csv_reader = csv.reader(open(embed_csv, 'r'))
            header = next(csv_reader)
            csv_readers.append(csv_reader)
            label_cols.append(header.index(args['label']))
            header.remove(args['label'])
            header_row += header
            csv_name += os.path.basename(embed_csv)[:-4] + '+'
        header_row.append(args['label'])
        csv_writer = csv.writer(open(os.path.join(args['output'], csv_name[:-1] + '.csv'), 'w', newline=''))
        csv_writer.writerow(header_row)
        for rows in zip(*csv_readers):
            merged_row = list()
            label_val = None
            for i, row in enumerate(rows):
                l_val = row.pop(label_cols[i])
                if not label_val:
                    label_val = l_val
                if label_val != l_val:
                    raise ValueError('All label values must be equal in the features to merge!')
                label_val = l_val
                merged_row += row
            csv_writer.writerow(merged_row + [label_val])
        return os.path.join(args['output'], csv_name[:-1] + '.csv')

    def get_strategies(self, sargs_list):
        for (strategy, sargs) in zip(self._strategies, sargs_list):
            try:
                yield getattr(fstrategies, strategy)                
            except AttributeError as e:
                logger.error("Can't find strategy '%s'." % (strategy))
                sys.exit(-1)
        